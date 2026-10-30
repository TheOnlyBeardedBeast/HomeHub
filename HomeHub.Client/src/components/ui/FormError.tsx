import * as stylex from '@stylexjs/stylex';
import { AlertCircle } from 'lucide-react';
import { colors, fonts, radius, space } from '../../styles/tokens.stylex';

const styles = stylex.create({
  formError: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    paddingBlock: '10px',
    paddingInline: '12px',
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
    color: colors.danger,
    fontFamily: fonts.sans,
    fontSize: '12.5px',
    lineHeight: 1.45,
    marginBottom: space.s4,
  },
});

export function FormError({ message }: { message: string }) {
  return (
    <div {...stylex.props(styles.formError)} role="alert">
      <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
      {message}
    </div>
  );
}
