import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Icon from "@/components/ui/icon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const Index = () => {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentView, setCurrentView] = useState<string>("dashboard");
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [vehicleOnMap, setVehicleOnMap] = useState<any>(null);
  const [vehicleHistory, setVehicleHistory] = useState<any>(null);

  const [newVehicle, setNewVehicle] = useState({
    id: "",
    brand: "",
    status: "active",
    location: "",
    driver: "",
  });

  const [newDriver, setNewDriver] = useState({
    name: "",
    phone: "",
    license: "",
    experience: "",
  });

  const stats = [
    { label: "Активных авто", value: "47", change: "+3", icon: "Car", color: "text-green-400" },
    { label: "Водителей на линии", value: "38", change: "+5", icon: "Users", color: "text-blue-400" },
    { label: "Расходы за месяц", value: "₽2.4M", change: "-8%", icon: "TrendingDown", color: "text-orange-400" },
    { label: "Пробег сегодня", value: "4,832 км", change: "+12%", icon: "Gauge", color: "text-purple-400" },
  ];

  const vehicles = [
    { id: "A-101", brand: "Mercedes Sprinter", status: "active", fuel: 85, location: "Москва, ул. Тверская", driver: "Иванов И.И.", mileage: "234 км" },
    { id: "A-102", brand: "Ford Transit", status: "active", fuel: 62, location: "Санкт-Петербург, Невский пр.", driver: "Петров П.П.", mileage: "189 км" },
    { id: "A-103", brand: "Volkswagen Crafter", status: "maintenance", fuel: 15, location: "СТО №4", driver: "—", mileage: "12 км" },
    { id: "A-104", brand: "Iveco Daily", status: "inactive", fuel: 0, location: "Парковка центральная", driver: "—", mileage: "0 км" },
    { id: "A-105", brand: "GAZ Next", status: "active", fuel: 91, location: "Казань, пр. Победы", driver: "Сидоров С.С.", mileage: "312 км" },
  ];

  const drivers = [
    { name: "Иванов Иван Иванович", rating: 4.9, trips: 234, efficiency: 96, status: "active" },
    { name: "Петров Петр Петрович", rating: 4.7, trips: 198, efficiency: 92, status: "active" },
    { name: "Сидоров Сергей Сергеевич", rating: 4.8, trips: 267, efficiency: 94, status: "active" },
    { name: "Кузнецов Алексей Павлович", rating: 4.6, trips: 156, efficiency: 89, status: "inactive" },
  ];

  const maintenanceSchedule = [
    { vehicle: "A-101", type: "ТО-2", date: "15 февраля", status: "scheduled" },
    { vehicle: "A-103", type: "Ремонт подвески", date: "Сегодня", status: "inProgress" },
    { vehicle: "A-107", type: "ТО-1", date: "18 февраля", status: "scheduled" },
    { vehicle: "A-102", type: "Замена масла", date: "22 февраля", status: "scheduled" },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "Активен", className: "status-active" },
      inactive: { label: "Не активен", className: "status-inactive" },
      maintenance: { label: "На ТО", className: "status-maintenance" },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesStatus = filterStatus === "all" || vehicle.status === filterStatus;
    const matchesSearch = 
      vehicle.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Truck" className="text-primary-foreground" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">AutoFleet Pro</h1>
              <p className="text-xs text-muted-foreground">Управление автопарком</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setShowNotifications(true)}>
              <Icon name="Bell" size={20} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)}>
              <Icon name="Settings" size={20} />
            </Button>
            <Avatar className="cursor-pointer">
              <AvatarFallback className="bg-primary text-primary-foreground">АД</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <aside className="fixed left-0 top-[73px] h-[calc(100vh-73px)] w-64 border-r border-border bg-card/50 backdrop-blur-sm p-4 hidden lg:block">
        <nav className="space-y-2">
          <Button 
            variant={currentView === "dashboard" ? "default" : "ghost"} 
            className="w-full justify-start gap-3"
            onClick={() => setCurrentView("dashboard")}
          >
            <Icon name="LayoutDashboard" size={18} />
            Дашборд
          </Button>
          <Button 
            variant={currentView === "vehicles" ? "default" : "ghost"} 
            className="w-full justify-start gap-3"
            onClick={() => setCurrentView("vehicles")}
          >
            <Icon name="Car" size={18} />
            Автопарк
          </Button>
          <Button 
            variant={currentView === "drivers" ? "default" : "ghost"} 
            className="w-full justify-start gap-3"
            onClick={() => setCurrentView("drivers")}
          >
            <Icon name="Users" size={18} />
            Водители
          </Button>
          <Button 
            variant={currentView === "gps" ? "default" : "ghost"} 
            className="w-full justify-start gap-3"
            onClick={() => setCurrentView("gps")}
          >
            <Icon name="Map" size={18} />
            GPS мониторинг
          </Button>
          <Button 
            variant={currentView === "maintenance" ? "default" : "ghost"} 
            className="w-full justify-start gap-3"
            onClick={() => setCurrentView("maintenance")}
          >
            <Icon name="Wrench" size={18} />
            ТО и ремонт
          </Button>
          <Button 
            variant={currentView === "reports" ? "default" : "ghost"} 
            className="w-full justify-start gap-3"
            onClick={() => setCurrentView("reports")}
          >
            <Icon name="FileText" size={18} />
            Отчёты
          </Button>
          <Button 
            variant={currentView === "billing" ? "default" : "ghost"} 
            className="w-full justify-start gap-3"
            onClick={() => setCurrentView("billing")}
          >
            <Icon name="CreditCard" size={18} />
            Биллинг
          </Button>
        </nav>
      </aside>

      <main className="lg:ml-64 p-6 space-y-6">
        {currentView === "dashboard" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, idx) => (
                <Card key={idx} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <Icon name={stat.icon as any} className={stat.color} size={32} />
                      <Badge variant="secondary" className="text-xs">{stat.change}</Badge>
                    </div>
                    <div className="text-3xl font-bold mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="TrendingUp" size={20} />
                Расходы по категориям
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: "Топливо", value: 65, amount: "₽1.56M" },
                  { label: "ТО и ремонт", value: 20, amount: "₽480K" },
                  { label: "Страхование", value: 10, amount: "₽240K" },
                  { label: "Прочее", value: 5, amount: "₽120K" },
                ].map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-semibold">{item.amount}</span>
                    </div>
                    <Progress value={item.value} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="AlertCircle" size={20} />
                Уведомления
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <Icon name="AlertTriangle" className="text-red-400 flex-shrink-0" size={20} />
                  <div>
                    <p className="text-sm font-medium">Критический уровень топлива</p>
                    <p className="text-xs text-muted-foreground">A-103 • 15%</p>
                  </div>
                </div>
                <div className="flex gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <Icon name="Clock" className="text-yellow-400 flex-shrink-0" size={20} />
                  <div>
                    <p className="text-sm font-medium">Плановое ТО сегодня</p>
                    <p className="text-xs text-muted-foreground">A-101 • 14:00</p>
                  </div>
                </div>
                <div className="flex gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <Icon name="Info" className="text-blue-400 flex-shrink-0" size={20} />
                  <div>
                    <p className="text-sm font-medium">Истекает страховка</p>
                    <p className="text-xs text-muted-foreground">A-107 • через 5 дней</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="vehicles" className="space-y-4">
          <TabsList>
            <TabsTrigger value="vehicles">Автопарк</TabsTrigger>
            <TabsTrigger value="drivers">Водители</TabsTrigger>
            <TabsTrigger value="maintenance">График ТО</TabsTrigger>
          </TabsList>

          <TabsContent value="vehicles" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <CardTitle>Список автомобилей</CardTitle>
                  <Button onClick={() => setShowAddVehicle(true)}>
                    <Icon name="Plus" size={16} className="mr-2" />
                    Добавить авто
                  </Button>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      placeholder="Поиск по ID, марке, водителю или локации..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={filterStatus === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterStatus("all")}
                    >
                      Все ({vehicles.length})
                    </Button>
                    <Button
                      variant={filterStatus === "active" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterStatus("active")}
                      className={filterStatus === "active" ? "" : "status-active border"}
                    >
                      Активные
                    </Button>
                    <Button
                      variant={filterStatus === "maintenance" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterStatus("maintenance")}
                      className={filterStatus === "maintenance" ? "" : "status-maintenance border"}
                    >
                      На ТО
                    </Button>
                    <Button
                      variant={filterStatus === "inactive" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterStatus("inactive")}
                      className={filterStatus === "inactive" ? "" : "status-inactive border"}
                    >
                      Не активны
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredVehicles.length === 0 ? (
                  <div className="text-center py-12">
                    <Icon name="SearchX" className="mx-auto mb-3 text-muted-foreground" size={48} />
                    <p className="text-muted-foreground">Автомобили не найдены</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredVehicles.map((vehicle) => (
                    <div 
                      key={vehicle.id} 
                      className="p-4 border border-border rounded-lg hover:bg-card/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedVehicle(vehicle)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Icon name="Truck" className="text-primary" size={24} />
                          </div>
                          <div>
                            <div className="font-semibold flex items-center gap-2">
                              {vehicle.id} • {vehicle.brand}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Icon name="MapPin" size={14} />
                              {vehicle.location}
                            </div>
                          </div>
                        </div>
                        {getStatusBadge(vehicle.status)}
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground mb-1">Водитель</div>
                          <div className="font-medium">{vehicle.driver}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1">Топливо</div>
                          <div className="flex items-center gap-2">
                            <Progress value={vehicle.fuel} className="h-1.5 flex-1" />
                            <span className="font-medium">{vehicle.fuel}%</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1">Пробег сегодня</div>
                          <div className="font-medium">{vehicle.mileage}</div>
                        </div>
                      </div>
                    </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="drivers" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Водители</CardTitle>
                  <Button onClick={() => setShowAddDriver(true)}>
                    <Icon name="UserPlus" size={16} className="mr-2" />
                    Добавить водителя
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {drivers.map((driver, idx) => (
                    <div 
                      key={idx} 
                      className="p-4 border border-border rounded-lg hover:bg-card/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedDriver(driver)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {driver.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold">{driver.name}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Icon name="Star" size={14} className="text-yellow-400 fill-yellow-400" />
                              {driver.rating} • {driver.trips} поездок
                            </div>
                          </div>
                        </div>
                        {getStatusBadge(driver.status)}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground mb-1">Эффективность</div>
                          <div className="flex items-center gap-2">
                            <Progress value={driver.efficiency} className="h-1.5 flex-1" />
                            <span className="font-medium">{driver.efficiency}%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm">
                            <Icon name="FileText" size={14} className="mr-1" />
                            Отчёт
                          </Button>
                          <Button variant="outline" size="sm">
                            <Icon name="MessageCircle" size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>График технического обслуживания</CardTitle>
                  <Button>
                    <Icon name="Calendar" size={16} className="mr-2" />
                    Запланировать ТО
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {maintenanceSchedule.map((item, idx) => (
                    <div key={idx} className="p-4 border border-border rounded-lg hover:bg-card/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Icon name="Wrench" className="text-primary" size={24} />
                          </div>
                          <div>
                            <div className="font-semibold">{item.vehicle} • {item.type}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Icon name="Calendar" size={14} />
                              {item.date}
                            </div>
                          </div>
                        </div>
                        {item.status === "inProgress" ? (
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">В работе</Badge>
                        ) : (
                          <Badge variant="outline">Запланировано</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Map" size={20} />
                GPS мониторинг
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted/30 rounded-lg flex items-center justify-center border border-border">
                <div className="text-center">
                  <Icon name="MapPin" size={48} className="mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-3">Интеграция с картами в разработке</p>
                  <Button variant="outline" size="sm" onClick={() => setCurrentView("gps")}>
                    Настроить GPS
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="CreditCard" size={20} />
                Биллинг и платежи
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted/30 rounded-lg flex items-center justify-center border border-border">
                <div className="text-center">
                  <Icon name="Wallet" size={48} className="mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-3">Модуль биллинга готовится к запуску</p>
                  <Button variant="outline" size="sm" onClick={() => setCurrentView("billing")}>
                    Настроить платежи
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
          </>
        )}

        {currentView === "vehicles" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <CardTitle>Управление автопарком</CardTitle>
                <Button onClick={() => setShowAddVehicle(true)}>
                  <Icon name="Plus" size={16} className="mr-2" />
                  Добавить авто
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    placeholder="Поиск по ID, марке, водителю или локации..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={filterStatus === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("all")}
                  >
                    Все ({vehicles.length})
                  </Button>
                  <Button
                    variant={filterStatus === "active" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("active")}
                    className={filterStatus === "active" ? "" : "status-active border"}
                  >
                    Активные
                  </Button>
                  <Button
                    variant={filterStatus === "maintenance" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("maintenance")}
                    className={filterStatus === "maintenance" ? "" : "status-maintenance border"}
                  >
                    На ТО
                  </Button>
                  <Button
                    variant={filterStatus === "inactive" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("inactive")}
                    className={filterStatus === "inactive" ? "" : "status-inactive border"}
                  >
                    Не активны
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredVehicles.length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="SearchX" className="mx-auto mb-3 text-muted-foreground" size={48} />
                  <p className="text-muted-foreground">Автомобили не найдены</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredVehicles.map((vehicle) => (
                    <div 
                      key={vehicle.id} 
                      className="p-4 border border-border rounded-lg hover:bg-card/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedVehicle(vehicle)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Icon name="Truck" className="text-primary" size={24} />
                          </div>
                          <div>
                            <div className="font-semibold flex items-center gap-2">
                              {vehicle.id} • {vehicle.brand}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Icon name="MapPin" size={14} />
                              {vehicle.location}
                            </div>
                          </div>
                        </div>
                        {getStatusBadge(vehicle.status)}
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground mb-1">Водитель</div>
                          <div className="font-medium">{vehicle.driver}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1">Топливо</div>
                          <div className="flex items-center gap-2">
                            <Progress value={vehicle.fuel} className="h-1.5 flex-1" />
                            <span className="font-medium">{vehicle.fuel}%</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1">Пробег сегодня</div>
                          <div className="font-medium">{vehicle.mileage}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {currentView === "drivers" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Управление водителями</CardTitle>
                <Button onClick={() => setShowAddDriver(true)}>
                  <Icon name="UserPlus" size={16} className="mr-2" />
                  Добавить водителя
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {drivers.map((driver, idx) => (
                  <div 
                    key={idx} 
                    className="p-4 border border-border rounded-lg hover:bg-card/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedDriver(driver)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {driver.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">{driver.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Icon name="Star" size={14} className="text-yellow-400 fill-yellow-400" />
                            {driver.rating} • {driver.trips} поездок
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(driver.status)}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground mb-1">Эффективность</div>
                        <div className="flex items-center gap-2">
                          <Progress value={driver.efficiency} className="h-1.5 flex-1" />
                          <span className="font-medium">{driver.efficiency}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {currentView === "gps" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Map" size={24} />
                  GPS мониторинг
                </CardTitle>
                {vehicleOnMap && (
                  <Button variant="ghost" size="sm" onClick={() => setVehicleOnMap(null)}>
                    <Icon name="X" size={14} className="mr-1" />
                    Сбросить
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {vehicleOnMap ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Icon name="Truck" size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{vehicleOnMap.id} • {vehicleOnMap.brand}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Icon name="MapPin" size={12} />
                        {vehicleOnMap.location}
                      </p>
                    </div>
                    <Badge className="ml-auto">{vehicleOnMap.status === "active" ? "В пути" : vehicleOnMap.status === "maintenance" ? "ТО" : "Стоит"}</Badge>
                  </div>
                  <div className="aspect-[16/9] bg-muted/30 rounded-lg flex items-center justify-center border border-border relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10" style={{backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 40px, currentColor 40px, currentColor 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, currentColor 40px, currentColor 41px)"}} />
                    <div className="text-center p-8 relative z-10">
                      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Icon name="MapPin" size={32} className="text-primary-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-1">{vehicleOnMap.location}</h3>
                      <p className="text-sm text-muted-foreground mb-4">Текущее местоположение автомобиля</p>
                      <p className="text-xs text-muted-foreground">Для отображения интерактивной карты подключите GPS-интеграцию</p>
                      <Button className="mt-4" size="sm">
                        <Icon name="Settings" size={14} className="mr-2" />
                        Настроить GPS
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="aspect-[16/9] bg-muted/30 rounded-lg flex items-center justify-center border border-border">
                  <div className="text-center p-8">
                    <Icon name="MapPin" size={64} className="mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">GPS мониторинг в реальном времени</h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                      Отслеживайте местоположение автомобилей на карте, анализируйте маршруты и оптимизируйте логистику
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button>
                        <Icon name="Settings" size={16} className="mr-2" />
                        Настроить интеграцию
                      </Button>
                      <Button variant="outline">
                        <Icon name="FileText" size={16} className="mr-2" />
                        Документация
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {currentView === "maintenance" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>График технического обслуживания</CardTitle>
                <Button>
                  <Icon name="Calendar" size={16} className="mr-2" />
                  Запланировать ТО
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {maintenanceSchedule.map((item, idx) => (
                  <div key={idx} className="p-4 border border-border rounded-lg hover:bg-card/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Icon name="Wrench" className="text-primary" size={24} />
                        </div>
                        <div>
                          <div className="font-semibold">{item.vehicle} • {item.type}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Icon name="Calendar" size={14} />
                            {item.date}
                          </div>
                        </div>
                      </div>
                      {item.status === "inProgress" ? (
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">В работе</Badge>
                      ) : (
                        <Badge variant="outline">Запланировано</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {currentView === "reports" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="FileText" size={24} />
                Отчёты и аналитика
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <Icon name="TrendingUp" className="mb-3 text-primary" size={32} />
                      <h3 className="font-semibold mb-1">Финансовый отчёт</h3>
                      <p className="text-sm text-muted-foreground">Расходы, доходы, прибыль</p>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <Icon name="Gauge" className="mb-3 text-blue-400" size={32} />
                      <h3 className="font-semibold mb-1">Отчёт по пробегу</h3>
                      <p className="text-sm text-muted-foreground">Километраж по авто</p>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <Icon name="Users" className="mb-3 text-green-400" size={32} />
                      <h3 className="font-semibold mb-1">Отчёт по водителям</h3>
                      <p className="text-sm text-muted-foreground">Эффективность работы</p>
                    </CardContent>
                  </Card>
                </div>
                <Button className="w-full">
                  <Icon name="Download" size={16} className="mr-2" />
                  Экспортировать все отчёты
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentView === "billing" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="CreditCard" size={24} />
                Биллинг и платежи
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted/30 rounded-lg flex items-center justify-center border border-border">
                <div className="text-center p-8">
                  <Icon name="Wallet" size={64} className="mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">Модуль биллинга</h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                    Управляйте платежами, счетами и финансовыми операциями вашего автопарка
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button>
                      <Icon name="Settings" size={16} className="mr-2" />
                      Настроить платежи
                    </Button>
                    <Button variant="outline">
                      <Icon name="HelpCircle" size={16} className="mr-2" />
                      Помощь
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <Dialog open={!!selectedVehicle} onOpenChange={() => setSelectedVehicle(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="Truck" size={24} />
              {selectedVehicle?.id} • {selectedVehicle?.brand}
            </DialogTitle>
            <DialogDescription>
              Подробная информация об автомобиле
            </DialogDescription>
          </DialogHeader>
          {selectedVehicle && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Статус</label>
                  <div className="mt-1">{getStatusBadge(selectedVehicle.status)}</div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Водитель</label>
                  <p className="font-medium mt-1">{selectedVehicle.driver}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Локация</label>
                  <p className="font-medium mt-1">{selectedVehicle.location}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Пробег сегодня</label>
                  <p className="font-medium mt-1">{selectedVehicle.mileage}</p>
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Уровень топлива</label>
                <div className="flex items-center gap-2 mt-2">
                  <Progress value={selectedVehicle.fuel} className="h-2 flex-1" />
                  <span className="font-medium">{selectedVehicle.fuel}%</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => { setVehicleOnMap(selectedVehicle); setSelectedVehicle(null); setCurrentView("gps"); }}>
                  <Icon name="MapPin" size={16} className="mr-2" />
                  Показать на карте
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => { setVehicleHistory(selectedVehicle); setSelectedVehicle(null); }}>
                  <Icon name="FileText" size={16} className="mr-2" />
                  История
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!vehicleHistory} onOpenChange={() => setVehicleHistory(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="FileText" size={24} />
              История поездок — {vehicleHistory?.id} {vehicleHistory?.brand}
            </DialogTitle>
            <DialogDescription>
              Последние поездки автомобиля
            </DialogDescription>
          </DialogHeader>
          {vehicleHistory && (
            <div className="space-y-3">
              {[
                { date: "20 марта 2026", route: "Москва, Тверская → Парковка Центр", distance: "12 км", duration: "28 мин", driver: vehicleHistory.driver !== "—" ? vehicleHistory.driver : "Не указан", time: "09:14" },
                { date: "19 марта 2026", route: "Склад №3 → Москва, Тверская", distance: "34 км", duration: "55 мин", driver: vehicleHistory.driver !== "—" ? vehicleHistory.driver : "Не указан", time: "14:22" },
                { date: "19 марта 2026", route: "Парковка Центр → Склад №3", distance: "31 км", duration: "50 мин", driver: vehicleHistory.driver !== "—" ? vehicleHistory.driver : "Не указан", time: "11:05" },
                { date: "18 марта 2026", route: "Москва → Подольск, Заказчик", distance: "48 км", duration: "1 ч 10 мин", driver: vehicleHistory.driver !== "—" ? vehicleHistory.driver : "Не указан", time: "08:30" },
                { date: "18 марта 2026", route: "Подольск → Москва", distance: "47 км", duration: "1 ч 15 мин", driver: vehicleHistory.driver !== "—" ? vehicleHistory.driver : "Не указан", time: "16:45" },
              ].map((trip, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card/40">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon name="Navigation" size={14} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm truncate">{trip.route}</p>
                      <span className="text-xs text-muted-foreground flex-shrink-0">{trip.time}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Icon name="MapPin" size={11} />{trip.distance}</span>
                      <span className="flex items-center gap-1"><Icon name="Clock" size={11} />{trip.duration}</span>
                      <span className="flex items-center gap-1"><Icon name="User" size={11} />{trip.driver}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{trip.date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedDriver} onOpenChange={() => setSelectedDriver(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="User" size={24} />
              {selectedDriver?.name}
            </DialogTitle>
            <DialogDescription>
              Профиль водителя
            </DialogDescription>
          </DialogHeader>
          {selectedDriver && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Рейтинг</label>
                  <p className="font-medium mt-1 flex items-center gap-1">
                    <Icon name="Star" size={16} className="text-yellow-400 fill-yellow-400" />
                    {selectedDriver.rating}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Поездок</label>
                  <p className="font-medium mt-1">{selectedDriver.trips}</p>
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Эффективность</label>
                <div className="flex items-center gap-2 mt-2">
                  <Progress value={selectedDriver.efficiency} className="h-2 flex-1" />
                  <span className="font-medium">{selectedDriver.efficiency}%</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1">
                  <Icon name="MessageCircle" size={16} className="mr-2" />
                  Написать
                </Button>
                <Button variant="outline" className="flex-1">
                  <Icon name="FileText" size={16} className="mr-2" />
                  Отчёт
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showAddVehicle} onOpenChange={setShowAddVehicle}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="Car" size={24} />
              Добавить автомобиль
            </DialogTitle>
            <DialogDescription>
              Заполните информацию о новом автомобиле
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="vehicleId">ID автомобиля</Label>
              <Input
                id="vehicleId"
                placeholder="Например: A-106"
                value={newVehicle.id}
                onChange={(e) => setNewVehicle({ ...newVehicle, id: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleBrand">Марка и модель</Label>
              <Input
                id="vehicleBrand"
                placeholder="Например: Mercedes Sprinter"
                value={newVehicle.brand}
                onChange={(e) => setNewVehicle({ ...newVehicle, brand: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleLocation">Локация</Label>
              <Input
                id="vehicleLocation"
                placeholder="Например: Москва, ул. Ленина"
                value={newVehicle.location}
                onChange={(e) => setNewVehicle({ ...newVehicle, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleDriver">Водитель (необязательно)</Label>
              <Input
                id="vehicleDriver"
                placeholder="Например: Иванов И.И."
                value={newVehicle.driver}
                onChange={(e) => setNewVehicle({ ...newVehicle, driver: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleStatus">Статус</Label>
              <Select value={newVehicle.status} onValueChange={(value) => setNewVehicle({ ...newVehicle, status: value })}>
                <SelectTrigger id="vehicleStatus">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Активен</SelectItem>
                  <SelectItem value="inactive">Не активен</SelectItem>
                  <SelectItem value="maintenance">На ТО</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddVehicle(false)}>
              Отмена
            </Button>
            <Button onClick={() => {
              if (!newVehicle.id || !newVehicle.brand || !newVehicle.location) {
                toast.error("Заполните обязательные поля");
                return;
              }
              toast.success("Автомобиль добавлен в систему!");
              setShowAddVehicle(false);
              setNewVehicle({ id: "", brand: "", status: "active", location: "", driver: "" });
            }}>
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddDriver} onOpenChange={setShowAddDriver}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="UserPlus" size={24} />
              Добавить водителя
            </DialogTitle>
            <DialogDescription>
              Заполните информацию о новом водителе
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="driverName">ФИО водителя</Label>
              <Input
                id="driverName"
                placeholder="Например: Смирнов Алексей Петрович"
                value={newDriver.name}
                onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="driverPhone">Телефон</Label>
              <Input
                id="driverPhone"
                placeholder="+7 (999) 123-45-67"
                value={newDriver.phone}
                onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="driverLicense">Водительское удостоверение</Label>
              <Input
                id="driverLicense"
                placeholder="99 99 123456"
                value={newDriver.license}
                onChange={(e) => setNewDriver({ ...newDriver, license: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="driverExperience">Стаж вождения (лет)</Label>
              <Input
                id="driverExperience"
                type="number"
                placeholder="5"
                value={newDriver.experience}
                onChange={(e) => setNewDriver({ ...newDriver, experience: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDriver(false)}>
              Отмена
            </Button>
            <Button onClick={() => {
              if (!newDriver.name || !newDriver.phone || !newDriver.license) {
                toast.error("Заполните обязательные поля");
                return;
              }
              toast.success("Водитель добавлен в систему!");
              setShowAddDriver(false);
              setNewDriver({ name: "", phone: "", license: "", experience: "" });
            }}>
              <Icon name="UserPlus" size={16} className="mr-2" />
              Добавить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={showNotifications} onOpenChange={setShowNotifications}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Icon name="Bell" size={24} />
              Уведомления
            </SheetTitle>
            <SheetDescription>
              Важные события и напоминания
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <div className="flex gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <Icon name="AlertTriangle" className="text-red-400 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm font-medium">Критический уровень топлива</p>
                <p className="text-xs text-muted-foreground">A-103 • 15%</p>
              </div>
            </div>
            <div className="flex gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <Icon name="Clock" className="text-yellow-400 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm font-medium">Плановое ТО сегодня</p>
                <p className="text-xs text-muted-foreground">A-101 • 14:00</p>
              </div>
            </div>
            <div className="flex gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Icon name="Info" className="text-blue-400 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm font-medium">Истекает страховка</p>
                <p className="text-xs text-muted-foreground">A-107 • через 5 дней</p>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={showSettings} onOpenChange={setShowSettings}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Icon name="Settings" size={24} />
              Настройки
            </SheetTitle>
            <SheetDescription>
              Конфигурация системы
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <div className="space-y-2">
              <h3 className="font-semibold">Основные</h3>
              <Button variant="outline" className="w-full justify-start">
                <Icon name="Building" size={16} className="mr-2" />
                Профиль компании
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Icon name="Users" size={16} className="mr-2" />
                Управление пользователями
              </Button>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Интеграции</h3>
              <Button variant="outline" className="w-full justify-start">
                <Icon name="Map" size={16} className="mr-2" />
                GPS сервисы
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Icon name="CreditCard" size={16} className="mr-2" />
                Платёжные системы
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Index;