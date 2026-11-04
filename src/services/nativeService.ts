import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Network } from '@capacitor/network';

/**
 * Initializes native Android device integrations:
 * - Status bar theming (Navy #0B1F46)
 * - Hardware back button handling
 * - Network connectivity state monitoring
 * - Native splash screen dismissal
 */
export async function initNativeApp(callbacks?: {
  onOffline?: () => void;
  onOnline?: () => void;
  canGoBack?: () => boolean;
  goBack?: () => void;
}) {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    // 1. Status Bar Configuration
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#0B1F46' });
  } catch (err) {
    console.warn('[Native] StatusBar config error:', err);
  }

  try {
    // 2. Hide Native Splash once Web View is loaded
    await SplashScreen.hide();
  } catch (err) {
    console.warn('[Native] SplashScreen hide error:', err);
  }

  try {
    // 3. Hardware Back Button Handling
    await CapApp.addListener('backButton', ({ canGoBack }) => {
      if (callbacks?.canGoBack && callbacks.canGoBack()) {
        callbacks.goBack?.();
        return;
      }

      if (window.history.length > 1 && canGoBack) {
        window.history.back();
      } else {
        // Exit app if on root / no prior history
        CapApp.exitApp();
      }
    });
  } catch (err) {
    console.warn('[Native] BackButton listener error:', err);
  }

  try {
    // 4. Network Status Monitoring
    await Network.addListener('networkStatusChange', (status) => {
      if (!status.connected) {
        console.warn('[Native] Device is offline');
        callbacks?.onOffline?.();
      } else {
        console.info('[Native] Device is online (via ' + status.connectionType + ')');
        callbacks?.onOnline?.();
      }
    });
  } catch (err) {
    console.warn('[Native] Network listener error:', err);
  }
}

