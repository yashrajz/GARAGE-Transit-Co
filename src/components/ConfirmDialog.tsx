import React from 'react'
import Modal from './Modal'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => void
  onClose: () => void
}

export default function ConfirmDialog({
  open, title, description, confirmLabel = 'Confirm', onConfirm, onClose,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button
            onClick={onClose}
            className="btn-ghost px-5 py-2.5 text-sm rounded-[4px]"
          >
            Go back
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className="btn-bus px-5 py-2.5 text-sm rounded-[4px]"
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <span className="bg-danger/10 border border-danger/25 p-2 shrink-0 rounded-[4px]">
          <AlertTriangle className="h-4 w-4 text-danger" />
        </span>
        <p className="text-sm text-ink/75 leading-relaxed pt-1">{description}</p>
      </div>
    </Modal>
  )
}
