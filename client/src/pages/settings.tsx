import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Unlink } from "lucide-react";
import Layout from "@/components/layout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const [newSmsData, setNewSmsData] = useState({ phoneNumber: "", provider: "twilio", webhookUrl: "" });
  const { toast } = useToast();

  const { data: settings } = useQuery({
    queryKey: ["/api/settings"],
  });

  const { data: smsAccounts } = useQuery({
    queryKey: ["/api/sms-accounts"],
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: any) => apiRequest("PUT", "/api/settings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Settings Updated",
        description: "Your preferences have been saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const addSmsMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/sms-accounts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sms-accounts"] });
      setNewSmsData({ phoneNumber: "", provider: "twilio", webhookUrl: "" });
      toast({
        title: "SMS Account Added",
        description: "SMS account connected successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add SMS account",
        variant: "destructive",
      });
    },
  });

  const deleteSmsMutation = useMutation({
    mutationFn: (accountId: string) => apiRequest("DELETE", `/api/sms-accounts/${accountId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sms-accounts"] });
      toast({
        title: "SMS Account Removed",
        description: "SMS account disconnected successfully",
      });
    },
  });

  const handleSettingChange = (key: string, value: any) => {
    updateSettingsMutation.mutate({ [key]: value });
  };

  const handleAddSms = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSmsData.phoneNumber) return;
    
    addSmsMutation.mutate({
      ...newSmsData,
      isConnected: true,
    });
  };

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-textPrimary mb-4">Settings</h2>
        
        {/* SMS Integration */}
        <div className="bg-surface rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-textPrimary mb-4">SMS Integration</h3>
          <p className="text-sm text-textSecondary mb-4">
            Connect your phone number to automatically scan SMS messages for coupon codes. 
            We use secure webhook integration - no credentials are stored.
          </p>
          <div className="space-y-4">
            {(smsAccounts ?? []).map((account: any) => (
              <div key={account.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">📱</span>
                  </div>
                  <div>
                    <div className="font-medium text-textPrimary">{account.provider}</div>
                    <div className="text-sm text-textSecondary">{account.phoneNumber}</div>
                    {account.webhookUrl && (
                      <div className="text-xs text-textSecondary mt-1">Webhook configured</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Connected
                  </span>
                  <button
                    onClick={() => deleteSmsMutation.mutate(account.id)}
                    className="text-red-600 hover:text-red-700"
                    disabled={deleteSmsMutation.isPending}
                  >
                    <Unlink size={16} />
                  </button>
                </div>
              </div>
            ))}
            
            <form onSubmit={handleAddSms} className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="flex items-center space-x-3 mb-4">
                <Plus className="text-textSecondary" size={20} />
                <span className="text-textSecondary">Add SMS Account</span>
              </div>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    value={newSmsData.phoneNumber}
                    onChange={(e) => setNewSmsData({ ...newSmsData, phoneNumber: e.target.value })}
                  />
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    value={newSmsData.provider}
                    onChange={(e) => setNewSmsData({ ...newSmsData, provider: e.target.value })}
                  >
                    <option value="twilio">Twilio</option>
                    <option value="aws-sns">AWS SNS</option>
                    <option value="webhook">Custom Webhook</option>
                  </select>
                </div>
                {newSmsData.provider === 'webhook' && (
                  <input
                    type="url"
                    placeholder="Webhook URL (optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    value={newSmsData.webhookUrl}
                    onChange={(e) => setNewSmsData({ ...newSmsData, webhookUrl: e.target.value })}
                  />
                )}
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={addSmsMutation.isPending}
                >
                  Add SMS Account
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Scan Settings */}
        <div className="bg-surface rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-textPrimary mb-4">Scan Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-textPrimary">Auto Scan</div>
                <div className="text-sm text-textSecondary">Automatically scan for new coupons</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings?.autoScan ?? false}
                  onChange={(e) => handleSettingChange("autoScan", e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-textPrimary">Scan Frequency</div>
                <div className="text-sm text-textSecondary">How often to check for new coupons</div>
              </div>
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                value={settings?.scanFrequency ?? 6}
                onChange={(e) => handleSettingChange("scanFrequency", parseInt(e.target.value))}
              >
                <option value={6}>Every 6 hours</option>
                <option value={12}>Every 12 hours</option>
                <option value={24}>Daily</option>
                <option value={168}>Weekly</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-surface rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-textPrimary mb-4">Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-textPrimary">Expiry Alerts</div>
                <div className="text-sm text-textSecondary">Get notified when coupons are about to expire</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings?.expiryAlerts ?? false}
                  onChange={(e) => handleSettingChange("expiryAlerts", e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-textPrimary">Alert Timing</div>
                <div className="text-sm text-textSecondary">When to send expiry notifications</div>
              </div>
              <div className="flex space-x-2">
                {[1, 3, 7].map((days) => (
                  <label key={days} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox text-primary"
                      checked={settings?.alertDays?.split(",").includes(days.toString()) ?? false}
                      onChange={(e) => {
                        const currentDays = settings?.alertDays?.split(",") ?? [];
                        const newDays = e.target.checked
                          ? [...currentDays, days.toString()]
                          : currentDays.filter((d: string) => d !== days.toString());
                        handleSettingChange("alertDays", newDays.join(","));
                      }}
                    />
                    <span className="ml-2 text-sm">{days} day{days > 1 ? "s" : ""}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Export Settings */}
        <div className="bg-surface rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-textPrimary mb-4">Export Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-textPrimary">Default Format</div>
                <div className="text-sm text-textSecondary">Preferred format for exporting data</div>
              </div>
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                value={settings?.exportFormat ?? "xlsx"}
                onChange={(e) => handleSettingChange("exportFormat", e.target.value)}
              >
                <option value="xlsx">Excel (.xlsx)</option>
                <option value="csv">CSV (.csv)</option>
                <option value="pdf">PDF (.pdf)</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-textPrimary">Include Categories</div>
                <div className="text-sm text-textSecondary">Add category columns in exports</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings?.includeCategories ?? false}
                  onChange={(e) => handleSettingChange("includeCategories", e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
