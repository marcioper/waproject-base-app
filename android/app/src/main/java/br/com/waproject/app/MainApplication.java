package br.com.waproject.base;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.avishayil.rnrestart.ReactNativeRestartPackage;
import com.masteratul.exceptionhandler.ReactNativeExceptionHandlerPackage;
import com.bugsnag.BugsnagReactNative;
import co.apptailor.googlesignin.RNGoogleSigninPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import co.apptailor.googlesignin.RNGoogleSigninPackage;
import com.facebook.reactnative.androidsdk.FBSDKPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import com.facebook.CallbackManager;
import com.facebook.FacebookSdk;
import com.facebook.reactnative.androidsdk.FBSDKPackage;
import com.facebook.appevents.AppEventsLogger;

import io.invertase.firebase.RNFirebasePackage;
import io.invertase.firebase.notifications.RNFirebaseNotificationsPackage; 
import io.invertase.firebase.messaging.RNFirebaseMessagingPackage;
import io.invertase.firebase.analytics.RNFirebaseAnalyticsPackage; 

import java.util.Arrays;
import java.util.List;

import org.devio.rn.splashscreen.SplashScreenReactPackage;
import co.apptailor.googlesignin.RNGoogleSigninPackage; 

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
          new RNGestureHandlerPackage(),
          new ReactNativeRestartPackage(),
          new ReactNativeExceptionHandlerPackage(),
          new RNFirebasePackage(),
          new RNFirebaseNotificationsPackage(),
          new RNFirebaseMessagingPackage(),
          new RNFirebaseAnalyticsPackage(),
          BugsnagReactNative.getPackage(),
          new RNGoogleSigninPackage(),
          new RNDeviceInfo(),
          new FBSDKPackage(mCallbackManager),
          new SplashScreenReactPackage() 
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
    FacebookSdk.sdkInitialize(getApplicationContext());
    AppEventsLogger.activateApp(this);
  }

  private static CallbackManager mCallbackManager = CallbackManager.Factory.create();

  protected static CallbackManager getCallbackManager() {
    return mCallbackManager;
  }
}
