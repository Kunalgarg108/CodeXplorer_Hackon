import { Toaster as Sonner } from "sonner";

const Toaster = ({ ...props }) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast bg-deep border border-steel/40 text-paper shadow-neo font-thin",
          description: "text-fog",
          actionButton: "bg-signal text-paper",
          cancelButton: "bg-indigo text-fog",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
