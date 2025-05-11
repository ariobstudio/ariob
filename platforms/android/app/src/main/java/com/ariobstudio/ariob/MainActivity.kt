package com.ariobstudio.ariob

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.view.Window
import android.view.WindowManager
import com.lynx.tasm.LynxView
import com.lynx.tasm.LynxViewBuilder

class MainActivity : Activity() {
    companion object {
        private const val TAG = "MainActivity"
    }
    
    private lateinit var bundleLoader: BundleLoader
    private lateinit var lynxView: LynxView
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Enable hardware acceleration
        window.setFlags(
            WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED,
            WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED
        )
        
        // Request full screen
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        
        // Initialize the bundle loader
        bundleLoader = BundleLoader(this)
        
        // Create optimized Lynx view
        lynxView = buildLynxView()
        
        // Set layer type for better performance
        lynxView.setLayerType(View.LAYER_TYPE_HARDWARE, null)
        
        // Set content
        setContentView(lynxView)
        
        // Load the bundle with optimized approach
        loadBundle()
    }
    
    private fun loadBundle() {
        try {
            // Use our optimized bundle loader
            bundleLoader.loadBundle(lynxView)
        } catch (e: Exception) {
            Log.e(TAG, "Error loading bundle", e)
        }
    }

    private fun buildLynxView(): LynxView {
        val viewBuilder = LynxViewBuilder()
        // Use NetworkTemplateProvider to enable loading from URLs
        viewBuilder.setTemplateProvider(NetworkTemplateProvider(this))
        
        return viewBuilder.build(this)
    }
    
    override fun onResume() {
        super.onResume()
        // Refresh bundle if needed when returning to app
        if (::lynxView.isInitialized && ::bundleLoader.isInitialized) {
            bundleLoader.loadBundle(lynxView)
        }
    }
}