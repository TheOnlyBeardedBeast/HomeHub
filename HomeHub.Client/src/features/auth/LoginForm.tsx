import { useForm } from '@tanstack/react-form';
import * as stylex from '@stylexjs/stylex';
import { ArrowRight, Eye, EyeOff, KeyRound, ScanLine } from 'lucide-react';
import { useState } from 'react';
import { verifyApiKey } from '../../api/clients';
import { Button, IconButton } from '../../components/ui/Button';
import { FormError } from '../../components/ui/FormError';
import { TextField } from '../../components/ui/TextField';
import { errorMessage } from '../../lib/errors';
import { queryClient } from '../../lib/queryClient';
import { setApiKey } from '../../lib/session';
import { toast } from '../../lib/toasts';
import { space } from '../../styles/tokens.stylex';
import { QrScannerDialog } from './QrScannerDialog';

const styles = stylex.create({
  form: { display: 'flex', flexDirection: 'column', gap: space.s4 },
});

export function LoginForm() {
  const [showKey, setShowKey] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  async function unlock(rawKey: string) {
    setServerError(null);
    const key = rawKey.trim();
    try {
      await verifyApiKey(key);
      queryClient.clear();
      setApiKey(key);
      toast('Welcome home.', 'success');
    } catch (error) {
      setServerError(errorMessage(error));
    }
  }

  const form = useForm({
    defaultValues: { apiKey: '' },
    onSubmit: async ({ value }) => {
      await unlock(value.apiKey);
    },
  });

  function handleScan(value: string) {
    setScanning(false);
    form.setFieldValue('apiKey', value);
    void unlock(value);
  }

  return (
    <>
      <form
        {...stylex.props(styles.form)}
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          form.handleSubmit();
        }}
      >
        {serverError && <FormError message={serverError} />}

        <form.Field
          name="apiKey"
          validators={{
            onSubmit: ({ value }) =>
              value.trim().length === 0 ? 'Paste your API key to continue.' : undefined,
          }}
        >
          {(field) => (
            <TextField
              field={field}
              label="Your API key"
              type={showKey ? 'text' : 'password'}
              placeholder="Paste the key from your household admin"
              autoComplete="off"
              spellCheck={false}
              autoFocus
              startIcon={<KeyRound size={15} />}
              endSlot={
                <IconButton
                  label={showKey ? 'Hide API key' : 'Show API key'}
                  size="sm"
                  onClick={() => setShowKey((value) => !value)}
                >
                  {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                </IconButton>
              }
            />
          )}
        </form.Field>

        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              size="lg"
              fullWidth
              loading={isSubmitting}
              disabled={!canSubmit}
              icon={<ArrowRight size={16} />}
            >
              Unlock HomeHub
            </Button>
          )}
        </form.Subscribe>

        <Button
          type="button"
          variant="secondary"
          size="lg"
          fullWidth
          icon={<ScanLine size={16} />}
          onClick={() => setScanning(true)}
        >
          Scan QR code with camera
        </Button>
      </form>

      {scanning && <QrScannerDialog onClose={() => setScanning(false)} onScan={handleScan} />}
    </>
  );
}
