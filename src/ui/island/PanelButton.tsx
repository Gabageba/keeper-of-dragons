import { css } from '@emotion/react';

interface Props {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

const styles = {
  btn: css`
    font-family: serif;
    font-size: 13px;
    background: #2a1e40;
    border: 1px solid #4a3a6e;
    border-radius: 3px;
    padding: 6px 12px;
    cursor: pointer;
    &:hover {
      background: #3a2e60;
    }
  `,
  default: css`
    color: #c9a84c;
  `,
  danger: css`
    color: #ff6b6b;
  `,
};

function PanelButton({ label, onClick, variant = 'default' }: Props) {
  return (
    <button css={[styles.btn, styles[variant]]} onClick={onClick}>
      {label}
    </button>
  );
}

export default PanelButton;
