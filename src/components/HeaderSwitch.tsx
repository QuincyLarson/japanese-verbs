type HeaderSwitchProps = {
  ariaLabel: string;
  offLabel: string;
  onLabel: string;
  checked: boolean;
  onToggle: () => void;
};

export function HeaderSwitch({
  ariaLabel,
  offLabel: _offLabel,
  onLabel: _onLabel,
  checked,
  onToggle,
}: HeaderSwitchProps) {
  return (
    <div className="header-switch">
      <button
        type="button"
        role="switch"
        aria-label={ariaLabel}
        aria-checked={checked}
        className={checked ? 'header-switch__control is-checked' : 'header-switch__control'}
        onClick={onToggle}
      >
        {checked ? (
          <svg aria-hidden="true" className="header-switch__icon" viewBox="0 0 24 24">
            <path
              d="M19.5 15.5A7.5 7.5 0 0 1 8.5 4.5a8.5 8.5 0 1 0 11 11Z"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
          </svg>
        ) : (
          <svg aria-hidden="true" className="header-switch__icon" viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="4.2"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path
              d="M12 2.5v2.3M12 19.2v2.3M4.8 4.8l1.6 1.6M17.6 17.6l1.6 1.6M2.5 12h2.3M19.2 12h2.3M4.8 19.2l1.6-1.6M17.6 6.4l1.6-1.6"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.8"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
