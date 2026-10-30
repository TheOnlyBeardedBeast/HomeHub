import * as stylex from '@stylexjs/stylex';
import { Check, Copy, ShieldCheck } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import { IconButton } from '../../components/ui/Button';
import { toast } from '../../lib/toasts';
import { colors, fonts, radius, space } from '../../styles/tokens.stylex';

const styles = stylex.create({
  success: { display: 'flex', flexDirection: 'column', gap: space.s4 },
  successHead: { display: 'flex', alignItems: 'flex-start', gap: '12px' },
  successIcon: {
    display: 'grid',
    placeItems: 'center',
    width: '38px',
    height: '38px',
    borderRadius: radius.pill,
    backgroundColor: colors.oliveSoft,
    color: colors.olive,
    flexShrink: 0,
  },
  successTitle: {
    fontFamily: fonts.display,
    fontSize: '21px',
    fontWeight: 540,
    letterSpacing: '-0.02em',
    color: colors.ink,
    margin: '0 0 3px',
  },
  successCopy: {
    fontFamily: fonts.sans,
    fontSize: '12.5px',
    lineHeight: 1.55,
    color: colors.inkMuted,
    margin: 0,
  },
  keyBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    borderRadius: radius.md,
    borderWidth: '1px',
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceSunken,
  },
  key: {
    flex: 1,
    minWidth: 0,
    fontFamily: fonts.mono,
    fontSize: '12px',
    lineHeight: 1.5,
    color: colors.ink,
    wordBreak: 'break-all',
    userSelect: 'all',
  },
  qrBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '14px',
    borderRadius: radius.md,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.border,
    backgroundColor: '#ffffff',
  },
  qrCaption: {
    fontFamily: fonts.sans,
    fontSize: '11.5px',
    lineHeight: 1.5,
    color: colors.inkMuted,
    margin: 0,
    textAlign: 'center',
  },
  warn: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    padding: '10px 12px',
    borderRadius: radius.md,
    backgroundColor: colors.accentWash,
    fontFamily: fonts.sans,
    fontSize: '11.5px',
    lineHeight: 1.55,
    color: colors.inkSoft,
  },
  warnIcon: { color: colors.accentInk, flexShrink: 0, marginTop: 1 },
});

export function MemberKeyResult({ name, apiKey }: { name: string; apiKey: string }) {
  const [copied, setCopied] = useState(false);

  async function copyKey() {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      toast('API key copied.', 'success');
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast('Could not access the clipboard. Select the key to copy it.', 'error');
    }
  }

  return (
    <div {...stylex.props(styles.success)}>
      <div {...stylex.props(styles.successHead)}>
        <span {...stylex.props(styles.successIcon)}>
          <Check size={18} />
        </span>
        <div>
          <h3 {...stylex.props(styles.successTitle)}>{name}</h3>
          <p {...stylex.props(styles.successCopy)}>
            The key is shown once. Copy it now and hand it over privately.
          </p>
        </div>
      </div>

      <div {...stylex.props(styles.keyBox)}>
        <code {...stylex.props(styles.key)}>{apiKey}</code>
        <IconButton label="Copy API key" size="sm" variant="secondary" onClick={copyKey}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </IconButton>
      </div>

      <div {...stylex.props(styles.qrBox)}>
        <QRCodeSVG
          value={apiKey}
          size={176}
          level="M"
          marginSize={2}
          bgColor="#ffffff"
          fgColor="#000000"
          title={`API key for ${name}`}
        />
        <p {...stylex.props(styles.qrCaption)}>Scan to copy the key onto another device.</p>
      </div>

      <div {...stylex.props(styles.warn)}>
        <ShieldCheck size={15} {...stylex.props(styles.warnIcon)} />
        <span>
          Only a hash of this key is stored on the server. If it is lost, delete the member and
          create a new key.
        </span>
      </div>
    </div>
  );
}
