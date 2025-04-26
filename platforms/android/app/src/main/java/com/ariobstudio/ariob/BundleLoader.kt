package com.ariobstudio.ariob

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.util.Log
import com.lynx.tasm.LynxView
import java.io.File
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URL
import java.text.SimpleDateFormat
import java.util.concurrent.Executors
import java.util.Date
import java.util.Locale
import java.util.TimeZone

/**
 * Optimized BundleLoader with caching for better performance
 */
class BundleLoader(private val context: Context) {
    companion object {
        private const val TAG = "BundleLoader"
        private const val REMOTE_BUNDLE_URL = "http://10.0.0.13:3000/main.lynx.bundle?fullscreen=true"
        private const val LOCAL_BUNDLE_PATH = "main.lynx.bundle"
        private const val CACHE_BUNDLE_FILENAME = "cached_bundle.lynx"
        
        // Use a dedicated thread pool for network operations
        private val executor = Executors.newSingleThreadExecutor()
    }
    
    private val cacheDir: File by lazy { context.cacheDir }
    private val cachedBundleFile: File by lazy { File(cacheDir, CACHE_BUNDLE_FILENAME) }
    
    /**
     * Load the bundle into the provided LynxView with optimized caching
     */
    fun loadBundle(lynxView: LynxView) {
        // First try loading from cache immediately for faster startup
        if (cachedBundleFile.exists() && cachedBundleFile.length() > 0) {
            try {
                Log.d(TAG, "Loading bundle from cache first")
                lynxView.renderTemplateUrl("file://${cachedBundleFile.absolutePath}", "")
                
                // Then check for updates in background if network is available
                if (isNetworkAvailable()) {
                    refreshBundleFromRemote(lynxView)
                }
                return
            } catch (e: Exception) {
                Log.e(TAG, "Error loading from cache, will try other sources", e)
            }
        }
        
        // No valid cache, try remote or local
        if (isNetworkAvailable()) {
            try {
                Log.d(TAG, "Loading bundle from remote URL: $REMOTE_BUNDLE_URL")
                lynxView.renderTemplateUrl(REMOTE_BUNDLE_URL, "")
                
                // Cache the bundle in background
                downloadAndCacheBundle()
            } catch (e: Exception) {
                Log.e(TAG, "Error loading remote bundle, falling back to local", e)
                loadLocalBundle(lynxView)
            }
        } else {
            Log.d(TAG, "No network available, loading local bundle")
            loadLocalBundle(lynxView)
        }
    }
    
    /**
     * Background refresh of bundle without interrupting the user experience
     */
    private fun refreshBundleFromRemote(lynxView: LynxView) {
        executor.execute {
            try {
                // Check if remote bundle is newer or different
                if (downloadAndCacheBundle()) {
                    // If successfully updated, reload on UI thread
                    Log.d(TAG, "Remote bundle updated, reloading view")
                    lynxView.post {
                        try {
                            lynxView.renderTemplateUrl("file://${cachedBundleFile.absolutePath}", "")
                        } catch (e: Exception) {
                            Log.e(TAG, "Error reloading updated bundle", e)
                        }
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error refreshing bundle", e)
            }
        }
    }
    
    /**
     * Downloads and caches the bundle from remote URL
     * @return true if bundle was updated, false otherwise
     */
    private fun downloadAndCacheBundle(): Boolean {
        try {
            val url = URL(REMOTE_BUNDLE_URL)
            val connection = url.openConnection() as HttpURLConnection
            connection.requestMethod = "GET"
            connection.connectTimeout = 10000
            connection.readTimeout = 15000
            
            // Check if we have a cached bundle and include If-Modified-Since header
            if (cachedBundleFile.exists()) {
                val lastModified = cachedBundleFile.lastModified()
                val sdf = SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss 'GMT'", Locale.US)
                sdf.timeZone = TimeZone.getTimeZone("GMT")
                val formattedDate = sdf.format(Date(lastModified))
                connection.setRequestProperty("If-Modified-Since", formattedDate)
            }
            
            val responseCode = connection.responseCode
            
            if (responseCode == HttpURLConnection.HTTP_NOT_MODIFIED) {
                Log.d(TAG, "Remote bundle not modified")
                connection.disconnect()
                return false
            }
            
            if (responseCode == HttpURLConnection.HTTP_OK) {
                // Create a temp file first to avoid partial downloads
                val tempFile = File(cacheDir, "${CACHE_BUNDLE_FILENAME}.tmp")
                
                FileOutputStream(tempFile).use { outputStream ->
                    connection.inputStream.use { inputStream ->
                        val buffer = ByteArray(8192)
                        var bytesRead: Int
                        while (inputStream.read(buffer).also { bytesRead = it } != -1) {
                            outputStream.write(buffer, 0, bytesRead)
                        }
                        outputStream.flush()
                    }
                }
                
                // Replace the old file with the new one atomically
                if (tempFile.renameTo(cachedBundleFile)) {
                    Log.d(TAG, "Bundle successfully cached: ${cachedBundleFile.absolutePath}")
                    return true
                } else {
                    Log.e(TAG, "Failed to rename temp bundle file")
                }
            } else {
                Log.e(TAG, "HTTP Error: $responseCode")
            }
            
            connection.disconnect()
        } catch (e: Exception) {
            Log.e(TAG, "Error downloading bundle", e)
        }
        
        return false
    }
    
    /**
     * Load the bundle from a specific URL
     */
    fun loadBundleFromUrl(lynxView: LynxView, url: String) {
        try {
            Log.d(TAG, "Loading bundle from URL: $url")
            lynxView.renderTemplateUrl(url, "")
        } catch (e: Exception) {
            Log.e(TAG, "Error loading bundle from URL: $url", e)
            loadLocalBundle(lynxView)
        }
    }
    
    /**
     * Load the local bundle from assets
     */
    private fun loadLocalBundle(lynxView: LynxView) {
        try {
            Log.d(TAG, "Loading local bundle from assets: $LOCAL_BUNDLE_PATH")
            lynxView.renderTemplateUrl(LOCAL_BUNDLE_PATH, "")
        } catch (e: Exception) {
            Log.e(TAG, "Error loading local bundle", e)
        }
    }
    
    /**
     * Check if network is available
     */
    private fun isNetworkAvailable(): Boolean {
        val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val network = connectivityManager.activeNetwork ?: return false
        val capabilities = connectivityManager.getNetworkCapabilities(network) ?: return false
        
        return capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) &&
               capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED)
    }
} 