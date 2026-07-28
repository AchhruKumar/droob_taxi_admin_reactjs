import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import TickImg from "@/assets/tick-icon.svg";

const ConfirmationDialog = ({
  triggerText,
  triggerClass,
  title,
  open,
  onOpenChange,
  description,
  linkTo,
  linkText,
  loading,
  isDelete,
  onDelete,
  triggerVariant = "default",
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* <DialogTrigger className={triggerClass} asChild>
        <Button loading={loading} type="submit" variant={triggerVariant}>
          {triggerText}
        </Button>
      </DialogTrigger> */}

      <DialogContent
        showCloseButton={true}
        className="text-center p-5 rounded-2xl border-0 w-[393px]"
      >
        <img src={TickImg} className="w-16 h-16 mx-auto" alt="Success" />
        <h2 className="text-2xl">{title}</h2>
        <p className="text-xs text-[#AEAEAE]">{description}</p>

        <DialogFooter>
          {isDelete ? (
            <>
              <Button
                onClick={() => onOpenChange(false)}
                type="button"
                className="w-full shrink"
                variant={"outline"}
              >
                Cancel
              </Button>
              <Button
                onClick={onDelete}
                type="button"
                className="w-full shrink"
              >
                Delete
              </Button>
            </>
          ) : (
            <Button type="button" className="w-full shrink" asChild>
              <Link to={linkTo}>{linkText}</Link>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { ConfirmationDialog };
