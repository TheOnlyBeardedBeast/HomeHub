import * as stylex from '@stylexjs/stylex';
import { Plus, Trash2 } from 'lucide-react';
import { Button, IconButton } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import type { AppFormApi } from '../../components/ui/formApi';
import { plural } from '../../lib/format';
import { colors, fonts, radius } from '../../styles/tokens.stylex';

const styles = stylex.create({
  items: { display: 'flex', flexDirection: 'column', gap: '10px' },
  itemRow: { display: 'flex', alignItems: 'flex-end', gap: '8px' },
  itemField: { flex: 1, minWidth: 0 },
  itemLabel: {
    display: 'block',
    fontFamily: fonts.sans,
    fontSize: '12.5px',
    fontWeight: 620,
    letterSpacing: '-0.005em',
    color: colors.inkSoft,
    marginBottom: '6px',
  },
  addRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '12px',
  },
  count: {
    fontFamily: fonts.sans,
    fontSize: '11.5px',
    color: colors.inkMuted,
    padding: '3px 8px',
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSunken,
  },
});

interface ListFormValues {
  title: string;
  items: string[];
}

export function ListItemsField({
  form,
  itemId,
}: {
  form: AppFormApi<ListFormValues>;
  itemId: string;
}) {
  return (
    <form.Field name="items" mode="array">
      {(itemsField) => {
        function addItem() {
          const nextIndex = itemsField.state.value.length;
          itemsField.pushValue('');
          requestAnimationFrame(() => {
            document.getElementById(`${itemId}-${nextIndex}`)?.focus();
          });
        }

        return (
          <div>
            <span {...stylex.props(styles.itemLabel)}>Items</span>
            <div {...stylex.props(styles.items)}>
              {itemsField.state.value.map((_: string, index: number) => (
                <div key={index} {...stylex.props(styles.itemRow)}>
                  <div {...stylex.props(styles.itemField)}>
                    <form.Field name={`items[${index}]`}>
                      {(field) => (
                        <TextField
                          field={field}
                          id={`${itemId}-${index}`}
                          label={`Item ${index + 1}`}
                          placeholder={index === 0 ? 'Milk' : 'Something else…'}
                          {...(index === 0 ? { hint: 'Markdown links are supported.' } : {})}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                              event.preventDefault();
                              addItem();
                            }
                          }}
                        />
                      )}
                    </form.Field>
                  </div>
                  <IconButton
                    label={`Remove item ${index + 1}`}
                    size="sm"
                    onClick={() => itemsField.removeValue(index)}
                    style={{ marginBottom: 6 }}
                  >
                    <Trash2 size={14} />
                  </IconButton>
                </div>
              ))}
            </div>

            <div {...stylex.props(styles.addRow)}>
              <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={addItem}>
                Add item
              </Button>
              <span {...stylex.props(styles.count)}>
                {plural(
                  itemsField.state.value.filter((item: string) => item.trim()).length,
                  'item',
                )}
              </span>
            </div>
          </div>
        );
      }}
    </form.Field>
  );
}
