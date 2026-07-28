import React, { useState, forwardRef, useImperativeHandle } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ModalBase = forwardRef(
  ({ closeButton = true, title, description }, ref) => {
    const [isOpen, setIsOpen] = useState(false);

    useImperativeHandle(ref, () => ({
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    }));

    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent showCloseButton={closeButton}>
          <DialogHeader>
            <DialogTitle>{title || "Are you absolutely sure?"}</DialogTitle>
            <DialogDescription>
              {description ||
                "This action cannot be undone. This will permanently delete your account and remove your data from our servers."}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }
);

export default ModalBase;
