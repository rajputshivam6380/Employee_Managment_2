import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

export default function CommonAlert({
  open,
  setOpen,
  message,
  severity = "success",
}) {

  const handleClose = (_, reason) => {

    if (reason === "clickaway") return;

    setOpen(false);
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={handleClose}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      sx={{
        zIndex: 9999,
      }}
    >
      <Alert
        onClose={handleClose}
        severity={severity}
        variant="filled"
        sx={{
          width: "100%",
          minWidth: "320px",
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}