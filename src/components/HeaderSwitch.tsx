type HeaderSwitchProps = {
  ariaLabel: string;
  offLabel: string;
  onLabel: string;
  checked: boolean;
  onToggle: () => void;
};

export function HeaderSwitch({
  ariaLabel,
  offLabel,
  onLabel,
  checked,
  onToggle,
}: HeaderSwitchProps) {
  return (
    <div className="header-switch">
      <span className={checked ? 'header-switch__option' : 'header-switch__option is-active'}>
        {offLabel}
      </span>
      <button
        type="button"
        role="switch"
        aria-label={ariaLabel}
        aria-checked={checked}
        className={checked ? 'header-switch__control is-checked' : 'header-switch__control'}
        onClick={onToggle}
      >
        <span className="header-switch__thumb" />
      </button>
      <span className={checked ? 'header-switch__option is-active' : 'header-switch__option'}>
        {onLabel}
      </span>
    </div>
  );
}
