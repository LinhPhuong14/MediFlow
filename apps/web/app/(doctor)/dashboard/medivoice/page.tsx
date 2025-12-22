"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Bell,
  BookOpen,
  Bookmark,
  Brush,
  Camera,
  ChevronDown,
  Cloud,
  Code,
  Crown,
  Download,
  FileText,
  Grid,
  Heart,
  Home,
  ImageIcon,
  Layers,
  LayoutGrid,
  Lightbulb,
  Menu,
  MessageSquare,
  Palette,
  PanelLeft,
  Play,
  Plus,
  Search,
  Settings,
  Share2,
  Sparkles,
  Star,
  Trash,
  TrendingUp,
  Users,
  Video,
  Wand2,
  Clock,
  Eye,
  Archive,
  ArrowUpDown,
  MoreHorizontal,
  Type,
  CuboidIcon,
  X,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { url } from "inspector";

// Sample data for recent files
const recentFiles = [
  {
    name: "Báo cáo khám bệnh - Nguyễn Văn A.pdf",
    app: "MediVoice",
    modified: "2 ngày trước",
    size: "1.5 MB",
  },
  {
    name: "Báo cáo khám bệnh - Trần Thị B.pdf",
    app: "MediVoice",
    modified: "5 ngày trước",
    size: "2.2 MB",
  },
  {
    name: "Báo cáo khám bệnh - Lê Văn C.pdf",
    app: "MediVoice",
    modified: "1 tuần trước",
    size: "1.8 MB",
  },
  {
    name: "Báo cáo khám bệnh - Phạm Thị D.pdf",
    app: "MediVoice",
    modified: "2 tuần trước",
    size: "2.5 MB",
  },
];

// Sample data for projects
const projects = [
  {
    name: "Phiên khám bệnh - Nguyễn Văn A",
    description: "Báo cáo chi tiết về quá trình khám bệnh của bệnh nhân.",
    dueDate: "30 Sep 2024",
    progress: 75,
    members: 3,
    files: 5,
  },
  {
    name: "Phiên khám bệnh - Trần Thị B",
    description: "Báo cáo chi tiết về quá trình khám bệnh của bệnh nhân.",
    dueDate: "15 Oct 2024",
    progress: 50,
    members: 4,
    files: 8,
  },
  {
    name: "Phiên khám bệnh - Lê Văn C",
    description: "Báo cáo chi tiết về quá trình khám bệnh của bệnh nhân.",
    dueDate: "01 Nov 2024",
    progress: 30,
    members: 2,
    files: 3,
  },
  {
    name: "Phiên khám bệnh - Phạm Thị D",
    description: "Báo cáo chi tiết về quá trình khám bệnh của bệnh nhân.",
    dueDate: "10 Dec 2024",
    progress: 90,
    members: 5,
    files: 12,
  },
];
// Sample data for sidebar navigation
const sidebarItems = [
  {
    title: "Danh sách bệnh nhân",
    icon: <Home />,
    url: "/dashboard",
  },
  {
    title: "MediVoice",
    icon: <Layers />,
    url: "/dashboard/medivoice",
    isActive: true,
  },
  {
    title: "Tin nhắn",
    icon: <Users />,
    url: "/dashboard/messages",
  },
];

export default function MedivoiceDashboard() {
  const [progress, setProgress] = useState(0);
  const [notifications, setNotifications] = useState(5);
  const [activeTab, setActiveTab] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  );

  // Simulate progress loading
  useEffect(() => {
    const timer = setTimeout(() => setProgress(100), 1000);
    return () => clearTimeout(timer);
  }, []);

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <motion.div
        className="absolute inset-0 -z-10 opacity-20"
        animate={{
          background: [
            "radial-gradient(circle at 50% 50%, rgba(120, 41, 190, 0.5) 0%, rgba(53, 71, 125, 0.5) 50%, rgba(0, 0, 0, 0) 100%)",
            "radial-gradient(circle at 30% 70%, rgba(233, 30, 99, 0.5) 0%, rgba(81, 45, 168, 0.5) 50%, rgba(0, 0, 0, 0) 100%)",
            "radial-gradient(circle at 70% 30%, rgba(76, 175, 80, 0.5) 0%, rgba(32, 119, 188, 0.5) 50%, rgba(0, 0, 0, 0) 100%)",
            "radial-gradient(circle at 50% 50%, rgba(120, 41, 190, 0.5) 0%, rgba(53, 71, 125, 0.5) 50%, rgba(0, 0, 0, 0) 100%)",
          ],
        }}
        transition={{
          duration: 30,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Mobile */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-background transition-transform duration-300 ease-in-out md:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col border-r">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex aspect-square size-10 text-2xl items-center justify-center rounded-2xl  bg-gradient-to-br from-blue-400 to-green-400 text-white">
                🧑‍⚕️
              </div>
              <div>
                <h2 className="font-semibold">MediFlow</h2>
                <p className="text-xs text-muted-foreground">
                  Trang chủ bác sĩ
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <ScrollArea className="flex-1 px-3 py-2">
            <div className="space-y-1">
              {sidebarItems.map((item) => (
                <div key={item.title} className="mb-1">
                  <button
                    className={cn(
                      "flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium",
                      item.isActive
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    )}
                    onClick={() => (window.location.href = item.url || "#")}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.title}</span>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Sidebar - Desktop */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden w-56 transform border-r bg-background transition-transform duration-300 ease-in-out md:block",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="p-3">
            <div className="flex items-center gap-3">
              <div className="flex aspect-square size-10 text-2xl items-center justify-center rounded-2xl  bg-gradient-to-br from-blue-400 to-green-400 text-white">
                🧑‍⚕️
              </div>
              <div>
                <h2 className="font-semibold">MediFlow</h2>
                <p className="text-xs text-muted-foreground">
                  Trang chủ bác sĩ
                </p>
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1 px-3 py-2">
            <div className="space-y-1">
              {sidebarItems.map((item) => (
                <div key={item.title} className="mb-1">
                  <button
                    className={cn(
                      "flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium",
                      item.isActive
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-amber-800/20"
                    )}
                    onClick={() => (window.location.href = item.url || "#")}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.title}</span>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={cn(
          "min-h-screen transition-all duration-300 ease-in-out",
          sidebarOpen ? "md:pl-56" : "md:pl-0"
        )}
      >
        <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <PanelLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-1 items-center justify-between">
            <h1 className="text-xl font-semibold">MediVoice</h1>
            <div className="flex items-center gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-2xl relative"
                    >
                      <Bell className="h-5 w-5" />
                      {notifications > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                          {notifications}
                        </span>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Notifications</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Avatar className="h-9 w-9 border-2 border-primary">
                <AvatarImage
                  src="/placeholder.svg?height=40&width=40"
                  alt="User"
                />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="overflow-hidden rounded-3xl bg-transparent border-2 bg-clip-border border-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 p-8 text-teal-800"
            >
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-4">
                  <Badge className="bg-white/20 text-teal-800/50 hover:bg-white/30 rounded-xl">
                    MediVoice
                  </Badge>
                  <h3 className="text-3xl font-bold">Tạo bản ghi mới</h3>

                  <Button className="rounded-2xl bg-white text-teal-800/50 hover:bg-grey outline outline-1 outline-teal-800/20 hover:outline-teal-800/30">
                    Bản ghi mới
                  </Button>
                </div>
                <div className="hidden lg:block">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 50,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                    className="relative h-40 w-40"
                  >
                    <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-md" />
                    <div className="absolute inset-4 rounded-full bg-white/20" />
                    <div className="absolute inset-8 rounded-full bg-white/30" />
                    <div className="absolute inset-12 rounded-full bg-white/40" />
                    <div className="absolute inset-16 rounded-full bg-white/50" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </section>
          <div className="pt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Báo cáo khám bệnh</h2>
                <Button
                  variant="ghost"
                  className="rounded-2xl"
                  onClick={() =>
                    (window.location.href = "/dashboard/medivoice/reports")
                  }
                >
                  Xem thêm
                </Button>
              </div>
              <div className="rounded-3xl border">
                <div className="grid grid-cols-1 divide-y">
                  {recentFiles.slice(0, 4).map((file) => (
                    <motion.div
                      key={file.name}
                      whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                      className="flex items-center justify-between p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted">
                          {file.icon}
                        </div>
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {file.app} • {file.modified}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {file.shared && (
                          <Badge variant="outline" className="rounded-xl">
                            <Users className="mr-1 h-3 w-3" />
                            {file.collaborators}
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-xl"
                        >
                          Open
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Bản ghi âm</h2>
                <Button
                  variant="ghost"
                  className="rounded-2xl"
                  onClick={() =>
                    (window.location.href = "/dashboard/medivoice/records")
                  }
                >
                  Xem thêm
                </Button>
              </div>
              <div className="rounded-3xl border">
                <div className="grid grid-cols-1 divide-y">
                  {projects.slice(0, 3).map((project) => (
                    <motion.div
                      key={project.name}
                      whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                      className="p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{project.name}</h3>
                        <Badge variant="outline" className="rounded-xl">
                          Due {project.dueDate}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {project.description}
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <Progress
                          value={project.progress}
                          className="h-2 rounded-xl"
                        />
                      </div>
                      <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Users className="mr-1 h-4 w-4" />
                          {project.members} members
                        </div>
                        <div className="flex items-center">
                          <FileText className="mr-1 h-4 w-4" />
                          {project.files} files
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
