import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Unlink } from "lucide-react";
import Layout from "@/components/layout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const [isConnectingGmail, setIsConnectingGmail] = useState(false);
  const { toast } = useToast();

  const { data: settings } = useQuery({
    queryKey: ["/api/settings"],
  });

  const { data: emailAccounts } = useQuery({
    queryKey: ["/api/email-accounts"],
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

  const connectGmailMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/gmail');
      const result = await response.json();
      if (response.ok) {
        // In real implementation, redirect to Google OAuth
        // For demo, simulate successful connection
        return apiRequest("POST", "/api/auth/gmail/callback", { 
          code: "mock-auth-code", 
          email: "user@gmail.com" 
        });
      }
      throw new Error(result.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-accounts"] });
      setIsConnectingGmail(false);
      toast({
        title: "Gmail Connected",
        description: "Your Gmail account has been connected successfully",
      });
    },
    onError: () => {
      setIsConnectingGmail(false);
      toast({
        title: "Connection Failed",
        description: "Failed to connect Gmail account",
        variant: "destructive",
      });
    },
  });

  const deleteEmailMutation = useMutation({
    mutationFn: (accountId: string) => apiRequest("DELETE", `/api/email-accounts/${accountId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-accounts"] });
      toast({
        title: "Gmail Disconnected",
        description: "Gmail account disconnected successfully",
      });
    },
  });

  const handleSettingChange = (key: string, value: any) => {
    updateSettingsMutation.mutate({ [key]: value });
  };

  const handleConnectGmail = () => {
    setIsConnectingGmail(true);
    connectGmailMutation.mutate();
  };

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-textPrimary mb-4">Settings</h2>
        
        {/* Gmail Integration */}
        <div className="bg-surface rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-textPrimary mb-4">Gmail Integration</h3>
          <p className="text-sm text-textSecondary mb-4">
            Connect your Gmail account to automatically scan emails for coupon codes. 
            Uses secure OAuth 2.0 - no passwords stored, just like "Sign in with Google".
          </p>
          <div className="space-y-4">
            {(emailAccounts ?? []).map((account: any) => (
              <div key={account.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-red-600 font-bold text-sm">G</span>
                  </div>
                  <div>
                    <div className="font-medium text-textPrimary">Gmail</div>
                    <div className="text-sm text-textSecondary">{account.email}</div>
                    <div className="text-xs text-textSecondary mt-1">
                      Connected via OAuth - No passwords stored
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Connected
                  </span>
                  <button
                    onClick={() => deleteEmailMutation.mutate(account.id)}
                    className="text-red-600 hover:text-red-700"
                    disabled={deleteEmailMutation.isPending}
                  >
                    <Unlink size={16} />
                  </button>
                </div>
              </div>
            ))}
            
            {!(emailAccounts ?? []).length && (
              <div className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-red-600 font-bold text-lg">G</span>
                  </div>
                </div>
                <h4 className="text-lg font-medium text-textPrimary mb-2">Connect Gmail</h4>
                <p className="text-textSecondary mb-4">
                  Securely connect your Gmail account to start scanning for coupons
                </p>
                <button
                  onClick={handleConnectGmail}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
                  disabled={isConnectingGmail || connectGmailMutation.isPending}
                >
                  {(isConnectingGmail || connectGmailMutation.isPending) ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      <span>Connect Gmail Account</span>
                    </>
                  )}
                </button>
                <p className="text-xs text-textSecondary mt-3">
                  🔒 Secure OAuth 2.0 - No passwords or credentials stored
                </p>
              </div>
            )}
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
