import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { MoreView } from '@/components/more/MoreView';
import { getSection } from '@/navigation/sections';
import { useAppIcon } from '@/purchases/appIcon';
import { useThemePreference } from '@/theme/themeStore';

export default function MoreScreen() {
  const { t } = useTranslation(['settings', 'common']);
  const [themePreference] = useThemePreference();
  const [appIcon] = useAppIcon();
  const themeName =
    themePreference === 'system' ? t('themes.auto') : t(`themes.names.${themePreference}`);

  return (
    <MoreView
      appearanceSummary={t('more.themesSummary', {
        ns: 'common',
        theme: themeName,
        icon: t(`themes.icon.names.${appIcon}`),
      })}
      onOpenSection={(key) => router.push(getSection(key).href)}
      onOpenThemes={() => router.push('/themes')}
      onOpenPremium={() => router.push('/premium')}
      onOpenSettings={() => router.push('/settings')}
    />
  );
}
