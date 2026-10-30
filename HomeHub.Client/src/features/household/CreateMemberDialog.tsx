import { useForm } from '@tanstack/react-form';
import * as stylex from '@stylexjs/stylex';
import { KeyRound, Monitor, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useCreateUser } from '../../api/hooks/useCreateUser';
import { Button } from '../../components/ui/Button';
import { Dialog } from '../../components/ui/Dialog';
import { FormError } from '../../components/ui/FormError';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { TextField } from '../../components/ui/TextField';
import { UserType } from '../../gen/users_pb';
import { errorMessage } from '../../lib/errors';
import { colors, fonts, space } from '../../styles/tokens.stylex';
import { MemberKeyResult } from './MemberKeyResult';

type MemberKind = 'person' | 'display';

const styles = stylex.create({
  form: { display: 'flex', flexDirection: 'column', gap: space.s4 },
  typeField: { display: 'flex', flexDirection: 'column', gap: '6px' },
  typeLabel: {
    fontFamily: fonts.sans,
    fontSize: '12.5px',
    fontWeight: 620,
    letterSpacing: '-0.005em',
    color: colors.inkSoft,
  },
  typeHint: {
    fontFamily: fonts.sans,
    fontSize: '11.5px',
    color: colors.inkMuted,
    margin: 0,
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '8px',
    width: '100%',
  },
});

export function CreateMemberDialog({ onClose }: { onClose: () => void }) {
  const createUser = useCreateUser();
  const [serverError, setServerError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ name: string; apiKey: string } | null>(null);
  const [memberType, setMemberType] = useState<MemberKind>('person');

  const form = useForm({
    defaultValues: { fullName: '' },
    onSubmit: async ({ value }) => {
      setServerError(null);
      if (!value.fullName.trim()) return;
      try {
        const response = await createUser.mutateAsync({
          fullName: value.fullName.trim(),
          type: memberType === 'display' ? UserType.DISPLAY : UserType.END_USER,
        });
        setCreated({
          name: response.user?.fullName ?? value.fullName.trim(),
          apiKey: response.apiKey,
        });
      } catch (error) {
        setServerError(errorMessage(error));
      }
    },
  });

  return (
    <Dialog
      open
      onClose={onClose}
      title={created ? 'The key is ready' : 'Add a member or display'}
      description={
        created
          ? memberType === 'display'
            ? 'Enter this key on the display — it is the screen’s way into HomeHub.'
            : 'Give this key to them — it is their way into HomeHub.'
          : 'A person signs in on their own device; a display is a shared screen for the whole household.'
      }
      footer={
        <div {...stylex.props(styles.footer)}>
          {created ? (
            <Button onClick={onClose}>Done</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={onClose} disabled={createUser.isPending}>
                Cancel
              </Button>
              <Button
                loading={createUser.isPending}
                onClick={() => form.handleSubmit()}
                icon={<KeyRound size={14} />}
              >
                Create {memberType === 'display' ? 'display' : 'member'} & key
              </Button>
            </>
          )}
        </div>
      }
    >
      {created ? (
        <MemberKeyResult name={created.name} apiKey={created.apiKey} />
      ) : (
        <form
          {...stylex.props(styles.form)}
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
        >
          {serverError && <FormError message={serverError} />}
          <div {...stylex.props(styles.typeField)}>
            <span {...stylex.props(styles.typeLabel)}>Sign-in type</span>
            <SegmentedControl<MemberKind>
              value={memberType}
              onChange={setMemberType}
              options={[
                { value: 'person', label: 'Person', icon: <UserRound size={13} /> },
                { value: 'display', label: 'Display', icon: <Monitor size={13} /> },
              ]}
            />
            <p {...stylex.props(styles.typeHint)}>
              {memberType === 'display'
                ? 'A shared screen the whole household uses, like a kitchen display.'
                : 'A person signed in on their own phone or computer.'}
            </p>
          </div>
          <form.Field
            name="fullName"
            validators={{
              onSubmit: ({ value }) =>
                value.trim()
                  ? undefined
                  : memberType === 'display'
                    ? 'Give the display a name, like “Kitchen”.'
                    : 'Enter the name this person goes by.',
            }}
          >
            {(field) => (
              <TextField
                field={field}
                label={memberType === 'display' ? 'Display name' : 'Full name'}
                placeholder={memberType === 'display' ? 'e.g. Kitchen display' : 'e.g. Sam Rivera'}
                autoFocus
                hint={
                  memberType === 'display'
                    ? 'Shown wherever the display is credited.'
                    : 'Shown on tasks, notes and lists they create.'
                }
              />
            )}
          </form.Field>
        </form>
      )}
    </Dialog>
  );
}
