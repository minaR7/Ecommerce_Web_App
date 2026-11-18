import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Modal, Switch } from 'antd';
import { FEATURES } from '../config/features';
import {
  CONSENT_CATEGORIES,
  OPEN_SETTINGS_EVENT,
  getConsent,
  saveConsent,
} from '../consent/cookieConsent';

// Cookie consent banner + "Cookie settings" dialog.
// Rendered once in App. Does nothing while FEATURES.cookieConsent is false.
//
// EU rules this follows: nothing non-essential runs before a choice is made,
// rejecting is as easy as accepting (same-size buttons), no pre-ticked boxes,
// and the choice can be changed later from the footer link.
const CookieBanner = () => {
  const [bannerOpen, setBannerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [choices, setChoices] = useState({ analytics: false, marketing: false });

  useEffect(() => {
    if (!FEATURES.cookieConsent) return undefined;
    if (!getConsent()) setBannerOpen(true);

    const openSettings = () => {
      const saved = getConsent();
      setChoices({ analytics: !!saved?.analytics, marketing: !!saved?.marketing });
      setSettingsOpen(true);
    };
    window.addEventListener(OPEN_SETTINGS_EVENT, openSettings);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, openSettings);
  }, []);

  if (!FEATURES.cookieConsent) return null;

  const decide = (consent) => {
    saveConsent(consent);
    setBannerOpen(false);
    setSettingsOpen(false);
  };
  const acceptAll = () => decide({ analytics: true, marketing: true });
  const rejectAll = () => decide({ analytics: false, marketing: false });

  return (
    <>
      {bannerOpen && !settingsOpen && (
        <div
          role="dialog"
          aria-live="polite"
          aria-label="Cookie consent"
          className="cookie-banner fixed inset-x-0 bottom-0 z-[1000] p-3 sm:p-4"
        >
          <div className="cookie-banner-card mx-auto max-w-4xl rounded-xl bg-white text-gray-800 shadow-2xl ring-1 ring-black/10 p-4 sm:p-5 flex flex-col md:flex-row md:items-center gap-4">
            <p className="m-0 text-sm leading-relaxed flex-1">
              We use cookies that are needed for the site to work (login, cart and secure
              checkout). With your permission we'd also like to use analytics and marketing
              cookies. You can change your choice at any time from{' '}
              <span className="font-medium">Cookie settings</span> in the footer. See our{' '}
              <Link
                to="/privacy-policy"
                className="cookie-link"
                style={{ color: '#202836', textDecoration: 'underline', fontSize: 'inherit' }}
              >
                Privacy Policy
              </Link>.
            </p>
            <div className="flex flex-wrap gap-2 shrink-0">
              <Button onClick={rejectAll}>Technical only</Button>
              <Button onClick={() => { setChoices({ analytics: false, marketing: false }); setSettingsOpen(true); }}>
                Customise
              </Button>
              <Button type="primary" onClick={acceptAll} style={{ backgroundColor: '#202836' }}>
                Accept all
              </Button>
            </div>
          </div>
        </div>
      )}

      <Modal
        title="Cookie settings"
        open={settingsOpen}
        onCancel={() => setSettingsOpen(false)}
        footer={[
          <Button key="reject" onClick={rejectAll}>Technical only</Button>,
          <Button key="save" onClick={() => decide(choices)}>Save choices</Button>,
          <Button key="accept" type="primary" onClick={acceptAll} style={{ backgroundColor: '#202836' }}>
            Accept all
          </Button>,
        ]}
      >
        <div className="flex flex-col gap-4 py-2">
          {CONSENT_CATEGORIES.map((cat) => (
            <div key={cat.key} className="flex items-start justify-between gap-4">
              <div>
                <div className="font-semibold">{cat.title}</div>
                <div className="text-sm opacity-75">{cat.description}</div>
              </div>
              <Switch
                checked={cat.locked ? true : choices[cat.key]}
                disabled={cat.locked}
                onChange={(on) => setChoices((c) => ({ ...c, [cat.key]: on }))}
                aria-label={cat.title}
              />
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
};

export default CookieBanner;
