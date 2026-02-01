
/// User Preferences Interface
abstract class SettingsRepository {
  /// Get current user profile and settings.
  /// Returns a default object if none exists.
  Future<Map<String, dynamic>> getPreferences();

  /// Save updated preferences.
  Future<void> savePreferences(Map<String, dynamic> preferences);

  /// Theme preference (light/dark/system).
  Future<String> getThemeMode();
  
  /// Set theme preference.
  Future<void> setThemeMode(String mode);
}
