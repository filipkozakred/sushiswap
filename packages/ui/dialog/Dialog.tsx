import { Dialog as HeadlessDialog, Transition } from '@headlessui/react'
import React, { FC, Fragment, FunctionComponent } from 'react'

import { ExtractProps } from '../types'
import DialogActions, { DialogActionProps } from './DialogActions'
import DialogContent, { DialogContentProps } from './DialogContent'
import DialogDescription, { DialogDescriptionProps } from './DialogDescription'
import DialogHeader, { DialogHeaderProps } from './DialogHeader'

export type DialogRootProps = ExtractProps<typeof HeadlessDialog> & {
  afterLeave?(): void
  children?: React.ReactNode
}

const DialogRoot: FC<DialogRootProps> = ({ open, onClose, children, afterLeave, ...rest }) => {
  return (
    <Transition show={open} as={Fragment} afterLeave={afterLeave}>
      <HeadlessDialog className="relative z-[100]" onClose={onClose} {...rest}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur transform-gpu" />
        </Transition.Child>

        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end sm:items-center justify-center min-h-full text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <HeadlessDialog.Panel className="w-full h-full max-w-md px-1">{children}</HeadlessDialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </HeadlessDialog>
    </Transition>
  )
}

export const Dialog: FunctionComponent<DialogRootProps> & {
  Description: FunctionComponent<DialogDescriptionProps>
  Header: FunctionComponent<DialogHeaderProps>
  Actions: FunctionComponent<DialogActionProps>
  Content: FunctionComponent<DialogContentProps>
} = Object.assign(DialogRoot, {
  Content: DialogContent,
  Header: DialogHeader,
  Description: DialogDescription,
  Actions: DialogActions,
})
