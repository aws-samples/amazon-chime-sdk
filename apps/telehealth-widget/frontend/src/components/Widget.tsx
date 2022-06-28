import { ReactNode } from 'react';
import { PopOver, PopOverItem, lightTheme } from 'amazon-chime-sdk-component-library-react';
import { ThemeProvider } from 'styled-components';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useTranslation } from 'react-i18next';

import './Widget.css';
import Window from './Window';

export default function Widget({ children }: { children: ReactNode }): JSX.Element {
  const { user, signOut } = useAuthenticator();
  const { t } = useTranslation();
  return (
    <ThemeProvider theme={lightTheme}>
      <Window
        className="Widget__window"
        title={t('Widget.title')}
        rightNode={
          user ? (
            <PopOver className="Widget__popOver" a11yLabel="Menu" renderButton={() => <>•••</>} placement="bottom-end">
              <PopOverItem as="button" onClick={signOut} children={<span>{t('Widget.signOut')}</span>} />
            </PopOver>
          ) : undefined
        }
      >
        {children}
      </Window>
    </ThemeProvider>
  );
}
