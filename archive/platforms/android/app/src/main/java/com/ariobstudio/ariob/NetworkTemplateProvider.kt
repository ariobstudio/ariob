package com.ariobstudio.ariob

import android.content.Context
import com.lynx.tasm.provider.AbsTemplateProvider
import java.io.ByteArrayOutputStream
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL

class NetworkTemplateProvider(context: Context) : AbsTemplateProvider() {

    private var mContext: Context = context.applicationContext

    override fun loadTemplate(uri: String, callback: Callback) {
        Thread {
            try {
                // Check if the URI is a URL
                if (uri.startsWith("http://") || uri.startsWith("https://")) {
                    // Load from URL
                    loadFromUrl(uri, callback)
                } else {
                    // Load from assets (fallback to existing behavior)
                    loadFromAssets(uri, callback)
                }
            } catch (e: Exception) {
                callback.onFailed(e.message)
            }
        }.start()
    }
    
    private fun loadFromUrl(urlString: String, callback: Callback) {
        try {
            val url = URL(urlString)
            val connection = url.openConnection() as HttpURLConnection
            connection.requestMethod = "GET"
            connection.connectTimeout = 15000
            connection.readTimeout = 15000
            
            val responseCode = connection.responseCode
            if (responseCode == HttpURLConnection.HTTP_OK) {
                connection.inputStream.use { inputStream ->
                    ByteArrayOutputStream().use { byteArrayOutputStream ->
                        val buffer = ByteArray(1024)
                        var length: Int
                        while ((inputStream.read(buffer).also { length = it }) != -1) {
                            byteArrayOutputStream.write(buffer, 0, length)
                        }
                        callback.onSuccess(byteArrayOutputStream.toByteArray())
                    }
                }
            } else {
                callback.onFailed("HTTP Error: $responseCode")
            }
            connection.disconnect()
        } catch (e: Exception) {
            callback.onFailed(e.message)
        }
    }
    
    private fun loadFromAssets(uri: String, callback: Callback) {
        try {
            mContext.assets.open(uri).use { inputStream ->
                ByteArrayOutputStream().use { byteArrayOutputStream ->
                    val buffer = ByteArray(1024)
                    var length: Int
                    while ((inputStream.read(buffer).also { length = it }) != -1) {
                        byteArrayOutputStream.write(buffer, 0, length)
                    }
                    callback.onSuccess(byteArrayOutputStream.toByteArray())
                }
            }
        } catch (e: IOException) {
            callback.onFailed(e.message)
        }
    }
} 