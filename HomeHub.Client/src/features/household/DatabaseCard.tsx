import * as stylex from '@stylexjs/stylex';
import { Database, Download, Upload } from 'lucide-react';
import { useCallback, useRef, useState, type ChangeEvent } from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { colors, fonts, radius } from '../../styles/tokens.stylex';

const styles = stylex.create({
  title: {
    fontFamily: fonts.display,
    fontSize: '18px',
    fontWeight: 540,
    letterSpacing: '-0.02em',
    color: colors.ink,
    margin: '0 0 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
  },
  path: {
    display: 'block',
    margin: '0 0 10px',
    paddingBlock: '8px',
    paddingInline: '10px',
    borderRadius: radius.sm,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.border,
    backgroundColor: colors.surfaceSunken,
    fontFamily: fonts.mono,
    fontSize: '11px',
    lineHeight: 1.5,
    color: colors.inkSoft,
    wordBreak: 'break-all',
    userSelect: 'all',
  },
  copy: {
    margin: '0 0 12px',
    fontFamily: fonts.sans,
    fontSize: '12px',
    lineHeight: 1.6,
    color: colors.inkMuted,
  },
  actions: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
});

export function DatabaseCard({
  visible,
  path,
  pending,
  downloading,
  restoring,
  onDownload,
  onRestore,
}: {
  visible: boolean;
  path?: string;
  pending: boolean;
  downloading: boolean;
  restoring: boolean;
  onDownload: () => void;
  onRestore: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const chooseFile = useCallback(() => inputRef.current?.click(), []);
  const handleFile = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = '';
    if (file) setPendingFile(file);
  }, []);
  const cancelRestore = useCallback(() => setPendingFile(null), []);
  const confirmRestore = useCallback(() => {
    if (!pendingFile) return;
    onRestore(pendingFile);
    setPendingFile(null);
  }, [onRestore, pendingFile]);

  if (!visible) return null;

  return (
    <>
      <Card padding="md">
        <h3 {...stylex.props(styles.title)}>
          <Database size={16} color={colors.accent} /> Database
        </h3>
        <code {...stylex.props(styles.path)}>
          {pending ? 'Locating the database…' : (path ?? 'Path unavailable')}
        </code>
        <p {...stylex.props(styles.copy)}>
          Download a consistent snapshot for safekeeping, or restore one from a backup.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".db,.sqlite,.sqlite3,application/vnd.sqlite3"
          onChange={handleFile}
          hidden
        />
        <div {...stylex.props(styles.actions)}>
          <Button
            variant="secondary"
            size="sm"
            icon={<Download size={14} />}
            onClick={onDownload}
            loading={downloading}
            disabled={!path || restoring}
          >
            Download backup
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Upload size={14} />}
            onClick={chooseFile}
            loading={restoring}
            disabled={!path || downloading}
          >
            Restore backup
          </Button>
        </div>
      </Card>

      <ConfirmDialog
        open={Boolean(pendingFile)}
        title="Restore this backup?"
        description={
          pendingFile
            ? `Everything in the current database will be replaced by "${pendingFile.name}". This cannot be undone.`
            : ''
        }
        confirmLabel="Restore backup"
        busy={restoring}
        onConfirm={confirmRestore}
        onClose={cancelRestore}
      />
    </>
  );
}
