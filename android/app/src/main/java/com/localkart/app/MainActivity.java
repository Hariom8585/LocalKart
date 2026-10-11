package com.localkart.app;

import android.annotation.SuppressLint;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.net.ConnectivityManager;
import android.net.Network;
import android.net.NetworkCapabilities;
import android.net.Uri;
import android.net.http.SslError;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.GeolocationPermissions;
import android.webkit.SslErrorHandler;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.ProgressBar;
import android.widget.Toast;

import androidx.activity.OnBackPressedCallback;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

public class MainActivity extends AppCompatActivity {

    public static final String TARGET_URL = "https://local-kart-jade.vercel.app/";
    public static final String APPROVED_HOST = "local-kart-jade.vercel.app";

    private WebView webView;
    private SwipeRefreshLayout swipeRefreshLayout;
    private ProgressBar progressBar;
    private View offlineContainer;
    private View splashContainer;
    private Button btnRetry;

    private boolean isErrorOccurred = false;
    private long backPressedTime = 0;

    // File chooser launcher
    private ValueCallback<Uri[]> filePathCallback;
    private final ActivityResultLauncher<Intent> fileChooserLauncher =
            registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), result -> {
                if (filePathCallback != null) {
                    Uri[] results = null;
                    if (result.getResultCode() == RESULT_OK && result.getData() != null) {
                        if (result.getData().getClipData() != null) {
                            int count = result.getData().getClipData().getItemCount();
                            results = new Uri[count];
                            for (int i = 0; i < count; i++) {
                                results[i] = result.getData().getClipData().getItemAt(i).getUri();
                            }
                        } else if (result.getData().getData() != null) {
                            results = new Uri[]{result.getData().getData()};
                        }
                    }
                    filePathCallback.onReceiveValue(results);
                    filePathCallback = null;
                }
            });

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        initViews();
        setupWebView();
        setupSwipeRefresh();
        setupBackPressHandler();
        setupRetryButton();

        if (savedInstanceState == null) {
            loadApp();
        } else {
            webView.restoreState(savedInstanceState);
        }
    }

    private void initViews() {
        webView = findViewById(R.id.webView);
        swipeRefreshLayout = findViewById(R.id.swipeRefreshLayout);
        progressBar = findViewById(R.id.progressBar);
        offlineContainer = findViewById(R.id.offlineContainer);
        splashContainer = findViewById(R.id.splashContainer);
        btnRetry = findViewById(R.id.btnRetry);

        swipeRefreshLayout.setColorSchemeResources(
                R.color.primary,
                R.color.secondary,
                R.color.accent
        );
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void setupWebView() {
        WebSettings settings = webView.getSettings();

        // Security controls
        settings.setJavaScriptEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);

        // Responsive & storage capabilities
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setMediaPlaybackRequiresUserGesture(false);

        // App identification
        String defaultUa = settings.getUserAgentString();
        settings.setUserAgentString(defaultUa + " LocalKartApp/1.0 (Android; " + Build.MODEL + ")");

        // Cookies
        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        cookieManager.setAcceptThirdPartyCookies(webView, true);

        webView.setWebViewClient(new LocalKartWebViewClient());
        webView.setWebChromeClient(new LocalKartWebChromeClient());
    }

    private void setupSwipeRefresh() {
        swipeRefreshLayout.setOnRefreshListener(() -> {
            if (isNetworkAvailable()) {
                webView.reload();
            } else {
                swipeRefreshLayout.setRefreshing(false);
                showOfflineScreen();
            }
        });

        // Only allow swipe to refresh when WebView is scrolled to the absolute top
        webView.getViewTreeObserver().addOnScrollChangedListener(() -> {
            if (webView.getScrollY() == 0) {
                swipeRefreshLayout.setEnabled(true);
            } else {
                swipeRefreshLayout.setEnabled(false);
            }
        });
    }

    private void setupBackPressHandler() {
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (offlineContainer.getVisibility() == View.VISIBLE) {
                    finish();
                    return;
                }

                if (webView.canGoBack()) {
                    webView.goBack();
                } else {
                    if (System.currentTimeMillis() - backPressedTime < 2000) {
                        finish();
                    } else {
                        backPressedTime = System.currentTimeMillis();
                        Toast.makeText(MainActivity.this, getString(R.string.press_again_exit), Toast.LENGTH_SHORT).show();
                    }
                }
            }
        });
    }

    private void setupRetryButton() {
        btnRetry.setOnClickListener(v -> {
            if (isNetworkAvailable()) {
                offlineContainer.setVisibility(View.GONE);
                splashContainer.setVisibility(View.VISIBLE);
                loadApp();
            } else {
                Toast.makeText(MainActivity.this, "Still offline. Please check your connection.", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void loadApp() {
        if (!isNetworkAvailable()) {
            showOfflineScreen();
            return;
        }

        isErrorOccurred = false;
        Intent intent = getIntent();
        Uri data = intent != null ? intent.getData() : null;

        if (data != null && data.getHost() != null && data.getHost().contains(APPROVED_HOST)) {
            webView.loadUrl(data.toString());
        } else {
            webView.loadUrl(TARGET_URL);
        }
    }

    private void showOfflineScreen() {
        isErrorOccurred = true;
        splashContainer.setVisibility(View.GONE);
        progressBar.setVisibility(View.GONE);
        swipeRefreshLayout.setRefreshing(false);
        offlineContainer.setVisibility(View.VISIBLE);
    }

    private boolean isNetworkAvailable() {
        ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
        if (cm == null) return false;

        Network network = cm.getActiveNetwork();
        if (network == null) return false;

        NetworkCapabilities capabilities = cm.getNetworkCapabilities(network);
        return capabilities != null && (
                capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) ||
                capabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) ||
                capabilities.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET));
    }

    @Override
    protected void onSaveInstanceState(@NonNull Bundle outState) {
        super.onSaveInstanceState(outState);
        webView.saveState(outState);
    }

    @Override
    protected void onPause() {
        super.onPause();
        CookieManager.getInstance().flush();
    }

    // ==========================================
    // WebViewClient Implementation
    // ==========================================
    private class LocalKartWebViewClient extends WebViewClient {

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            Uri uri = request.getUrl();
            return handleUrl(uri);
        }

        @Override
        @SuppressWarnings("deprecation")
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            return handleUrl(Uri.parse(url));
        }

        private boolean handleUrl(Uri uri) {
            if (uri == null) return false;

            String scheme = uri.getScheme();
            String host = uri.getHost();

            // Only allow secure HTTPS within app
            if ("https".equalsIgnoreCase(scheme)) {
                // If within approved domain or payment processor callbacks, stay in WebView
                if (host != null && (
                        host.equalsIgnoreCase(APPROVED_HOST) ||
                        host.endsWith("." + APPROVED_HOST) ||
                        host.contains("razorpay.com"))) {
                    return false; // let WebView load it
                }

                // Any unrelated external HTTPS websites open in the system browser
                try {
                    Intent intent = new Intent(Intent.ACTION_VIEW, uri);
                    startActivity(intent);
                    return true;
                } catch (Exception e) {
                    return false;
                }
            }

            // External intent schemes (tel:, mailto:, sms:, whatsapp:, upi:)
            if ("tel".equalsIgnoreCase(scheme) ||
                "mailto".equalsIgnoreCase(scheme) ||
                "sms".equalsIgnoreCase(scheme) ||
                "whatsapp".equalsIgnoreCase(scheme) ||
                "upi".equalsIgnoreCase(scheme)) {
                try {
                    Intent intent = new Intent(Intent.ACTION_VIEW, uri);
                    startActivity(intent);
                    return true;
                } catch (Exception e) {
                    Toast.makeText(MainActivity.this, "No app available to open this link", Toast.LENGTH_SHORT).show();
                    return true;
                }
            }

            return false;
        }

        @Override
        public void onPageStarted(WebView view, String url, Bitmap favicon) {
            super.onPageStarted(view, url, favicon);
            isErrorOccurred = false;
            progressBar.setVisibility(View.VISIBLE);
        }

        @Override
        public void onPageFinished(WebView view, String url) {
            super.onPageFinished(view, url);
            swipeRefreshLayout.setRefreshing(false);
            progressBar.setVisibility(View.GONE);

            if (!isErrorOccurred) {
                // Smoothly dismiss splash screen
                if (splashContainer.getVisibility() == View.VISIBLE) {
                    splashContainer.animate()
                            .alpha(0f)
                            .setDuration(250)
                            .withEndAction(() -> {
                                splashContainer.setVisibility(View.GONE);
                                splashContainer.setAlpha(1f);
                            })
                            .start();
                }
                offlineContainer.setVisibility(View.GONE);
            }
        }

        @Override
        public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
            super.onReceivedError(view, request, error);
            // Only trigger offline view on main frame failure
            if (request.isForMainFrame()) {
                showOfflineScreen();
            }
        }

        @Override
        @SuppressWarnings("deprecation")
        public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
            super.onReceivedError(view, errorCode, description, failingUrl);
            showOfflineScreen();
        }

        @Override
        public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
            // SECURITY REQUIREMENT: Never bypass TLS certificate validation!
            handler.cancel();
            showOfflineScreen();
        }
    }

    // ==========================================
    // WebChromeClient Implementation
    // ==========================================
    private class LocalKartWebChromeClient extends WebChromeClient {

        @Override
        public void onProgressChanged(WebView view, int newProgress) {
            super.onProgressChanged(view, newProgress);
            if (newProgress < 100) {
                progressBar.setVisibility(View.VISIBLE);
                progressBar.setProgress(newProgress);
            } else {
                progressBar.setVisibility(View.GONE);
            }
        }

        @Override
        public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
            if (MainActivity.this.filePathCallback != null) {
                MainActivity.this.filePathCallback.onReceiveValue(null);
            }
            MainActivity.this.filePathCallback = filePathCallback;

            Intent intent = fileChooserParams.createIntent();
            try {
                fileChooserLauncher.launch(intent);
            } catch (Exception e) {
                MainActivity.this.filePathCallback = null;
                return false;
            }
            return true;
        }

        @Override
        public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
            // Only grant to approved LocalKart origin
            if (origin.contains(APPROVED_HOST)) {
                if (ContextCompat.checkSelfPermission(MainActivity.this, android.Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
                    callback.invoke(origin, true, false);
                } else {
                    ActivityCompat.requestPermissions(MainActivity.this, new String[]{android.Manifest.permission.ACCESS_FINE_LOCATION}, 1001);
                    callback.invoke(origin, true, false);
                }
            } else {
                callback.invoke(origin, false, false);
            }
        }
    }
}
