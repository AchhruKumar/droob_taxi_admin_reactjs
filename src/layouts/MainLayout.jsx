import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Bell } from "lucide-react";
import NotificationsIcon from "@mui/icons-material/Notifications";
import {
  IconButton,
  Badge,
  Popover,
  Typography,
  Box,
  MenuItem,
} from "@mui/material";

// UI Components
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Utilities
import { IMAGE_URL } from "@/utils/constants";
import { getRequest, patchRequest } from "@/utils/http-client/axiosClient";
import { MENU, DASHBOARD } from "@/utils/endPoints";
import { requestForToken } from "@/utils/firebase";

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.login);

  // States
  const [isAvailable, setIsAvailable] = useState(user?.isAvailable ?? true);
  const [loading, setLoading] = useState(false);
  const [notifOpen, setNotifOpen] = useState(null);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // --- Handlers ---

  const handleNotifOpen = (event) => setNotifOpen(event.currentTarget);
  const handleNotifClose = () => setNotifOpen(null);

  const formatDateTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getnotifications = async (pageNum = 1) => {
    setLoading(true);
    try {
      const response = await getRequest(
        `${DASHBOARD.GET_APP_NOTIFICATIONS}?page=${pageNum}`,
      );
      const {
        notifications: newNotifications,
        totalPages: total,
        totalUnread,
      } = response.data.data;

      setUnreadCount(totalUnread);
      setTotalPages(total);

      if (pageNum === 1) {
        setNotifications(newNotifications);
      } else {
        setNotifications((prev) => [...prev, ...newNotifications]);
      }

      setHasMore(pageNum < total);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleChange = async (checked) => {
    const id = user?._id || user?.id;
    if (!id) {
      toast.error("User ID not found");
      return;
    }

    setLoading(true);
    try {
      await patchRequest(`${MENU.UPDATE_RESTURENT_STATUS}`, {
        isAvailable: checked,
      });
      setIsAvailable(checked);
      toast.success(`Restaurant is now ${checked ? "Online" : "Offline"}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update status");
      setIsAvailable(!checked); // Revert UI
    } finally {
      setLoading(false);
    }
  };

  const handleRedirect = async (notif) => {
    // 1. Close Popover
    handleNotifClose();

    // 2. Optional: Mark as Read API Call
    if (!notif.isRead) {
      try {
        // Assuming you have an endpoint for this
        // await patchRequest(`${DASHBOARD.MARK_NOTIFICATION_READ}/${notif._id}`);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n)),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error("Failed to mark read", err);
      }
    }

    // 3. Navigation Logic based on notification type
    if (notif.orderId) {
      navigate(`/orders/${notif.orderId}`);
    } else {
      navigate("/notifications");
    }
  };

  // --- Effects ---

  // useEffect(() => {
  //   getnotifications(1);

  //   // Service Worker & Firebase Logic
  //   if ("serviceWorker" in navigator) {
  //     navigator.serviceWorker
  //       .register("/firebase-messaging-sw.js")
  //       .then(async (registration) => {
  //         const fbToken = await requestForToken(registration);
  //         if (fbToken) {
  //           // TODO: API call to save fbToken to user profile
  //           console.log("FCM Token Ready");
  //         }
  //       })
  //       .catch((err) => console.error("SW Registration Error", err));
  //   }
  // }, []);

  const firstLetter = user?.firstName?.[0]?.toUpperCase() || "U";
  const profileImage = user?.profileImg
    ? `${IMAGE_URL}/${user?.profileImg}`
    : "";

  return (
    <SidebarProvider className="md:grid md:grid-cols-[256px_calc(100%_-_256px)]">
      <AppSidebar />
      <SidebarInset>
        <header className="dash-header flex items-center justify-between bg-white/50 pe-10 border-b sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center">
            <div className="p-3">
              <SidebarTrigger />
            </div>
            <Separator orientation="vertical" className="mr-4 h-4" />
            <div className="flex gap-4 items-center py-2">
              <div className="relative">
                {profileImage ? (
                  <img
                    src={profileImage}
                    className="size-10 rounded-full object-cover border"
                    alt="Profile"
                  />
                ) : (
                  <div className="size-10 rounded-full flex items-center justify-center text-white font-bold bg-green-500">
                    {firstLetter}
                  </div>
                )}
              </div>
              <p className="text-sm font-medium hidden sm:block">
                Welcome,{" "}
                <span className="text-blue-600 font-bold">
                  {user?.firstName || "User"}
                </span>
              </p>
            </div>
          </div>
        

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <IconButton onClick={handleNotifOpen}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon className="text-gray-600" />
              </Badge>
            </IconButton>

            {/* Availability Toggle */}
            <div className="flex items-center space-x-3 bg-white px-4 py-1.5 rounded-full border shadow-sm">
              <Label
                htmlFor="availability-mode"
                className={`text-[10px] font-black tracking-tighter ${isAvailable ? "text-green-600" : "text-red-600"}`}
              >
                {isAvailable ? "ONLINE" : "OFFLINE"}
              </Label>
              <Switch
                id="availability-mode"
                disabled={loading}
                checked={isAvailable}
                onCheckedChange={handleToggleChange}
                className="data-[state=checked]:bg-green-500"
              />
            </div>

            {/* Notifications Popover */}
            <Popover
              open={Boolean(notifOpen)}
              anchorEl={notifOpen}
              onClose={handleNotifClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              slotProps={{
                paper: {
                  sx: {
                    mt: 2, // Spacing from the bell icon
                    width: 300,
                    maxHeight: 480,
                    borderRadius: "16px", // Matching your dashboard card corners
                    border: "1px solid #e5e7eb",
                    boxShadow:
                      "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
                    overflow: "hidden",
                  },
                },
              }}
            >
              <Box
                sx={{
                  p: 2,
                  bgcolor: "#f8fafc",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 800, color: "#1e293b" }}
                >
                  Notifications
                </Typography>
              </Box>

              <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
                {notifications.length > 0 ? (
                  <>
                    {notifications.map((notif) => (
                      <Box
                        key={notif.id || notif._id}
                        onClick={() => handleRedirect(notif)}
                        sx={{
                          py: 1.5,
                          px: 2,
                          cursor: "pointer",
                          borderBottom: "1px solid #f1f5f9",
                          transition: "all 0.2s",
                          backgroundColor: notif.isRead ? "white" : "#f0fdf4", // Light green tint for unread
                          "&:hover": { bgcolor: "#f1f5f9" },
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: notif.isRead ? 500 : 700,
                            color: "#334155",
                            fontSize: "0.85rem",
                          }}
                        >
                          {notif.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "#94a3b8", display: "block", mt: 0.5 }}
                        >
                          {formatDateTime(notif.createdAt)}
                        </Typography>
                      </Box>
                    ))}

                    {hasMore && (
                      <Box
                        onClick={() => {
                          const nextPage = page + 1;
                          setPage(nextPage);
                          getnotifications(nextPage);
                        }}
                        sx={{
                          p: 1.5,
                          textAlign: "center",
                          cursor: "pointer",
                          color: "#16a34a", // Droobna Green
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          "&:hover": { textDecoration: "underline" },
                        }}
                      >
                        {loading ? "Loading..." : "View previous notifications"}
                      </Box>
                    )}
                  </>
                ) : (
                  <Box sx={{ p: 4, textAlign: "center", color: "#94a3b8" }}>
                    <Typography variant="caption">No new updates</Typography>
                  </Box>
                )}
              </Box>
            </Popover>
          </div>
        </header>

        <main className="dash-body h-full p-7 bg-gray-50/50">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default MainLayout;
