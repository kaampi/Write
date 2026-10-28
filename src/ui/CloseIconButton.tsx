/** The one dismiss icon for every dialog/card that has its own header-row close control (Mats' request: stop mixing "Close" text and "×" glyphs). Cards whose only close action sits in a footer action row next to a primary button (e.g. AskAboutPassageCard) are a different pattern and keep their text button. */
export function CloseIconButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" className="icon-button close-icon-button" aria-label={label} onClick={onClick}>
      <svg viewBox="0 0 175 175" aria-hidden="true" focusable="false">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          fill="currentColor"
          transform="translate(-1480.209049,-428.209578)"
          d="M1611.299,428.21C1635.416,428.21 1654.996,447.789 1654.996,471.906L1654.996,559.3C1654.996,583.417 1635.416,602.997 1611.299,602.997L1523.906,602.997C1499.789,602.997 1480.209,583.417 1480.209,559.3L1480.209,471.906C1480.209,447.789 1499.789,428.21 1523.906,428.21L1611.299,428.21ZM1543.678,515.603L1519.992,539.289C1513.389,545.891 1513.389,556.612 1519.992,563.214C1526.594,569.816 1537.315,569.816 1543.917,563.214L1567.603,539.528L1591.288,563.214C1597.891,569.816 1608.611,569.816 1615.213,563.214C1621.816,556.612 1621.816,545.891 1615.213,539.289L1591.528,515.603L1615.213,491.917C1621.816,485.315 1621.816,474.595 1615.213,467.992C1608.611,461.39 1597.891,461.39 1591.288,467.992L1567.603,491.678L1543.917,467.992C1537.315,461.39 1526.594,461.39 1519.992,467.992C1513.389,474.595 1513.389,485.315 1519.992,491.917L1543.678,515.603Z"
        />
      </svg>
    </button>
  );
}
