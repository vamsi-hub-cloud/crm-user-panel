import Button from './Button';
import Modal from './Modal';

interface Props { open: boolean; title: string; message: string; confirmLabel?: string; onConfirm: () => void; onClose: () => void; loading?: boolean }

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', onConfirm, onClose, loading }: Props) {
  return (
    <Modal open={open} title={title} onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button variant="danger" loading={loading} onClick={onConfirm}>{confirmLabel}</Button></>}>
      <p className="text-sm text-slate-600">{message}</p>
    </Modal>
  );
}
