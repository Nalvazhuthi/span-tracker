import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Check,
  Star,
  Zap,
  CreditCard,
  History,
  Sparkles,
  Loader2,
  Lock,
  Smartphone,
  QrCode,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import QRCode from "react-qr-code";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Payments = () => {
  const { isPro, upgradeToPro, user } = useAuth();
  const { toast } = useToast();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly",
  );

  // Checkout State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<
    "method-selection" | "upi-scan" | "processing" | "success"
  >("method-selection");
  const [selectedMethod, setSelectedMethod] = useState<"upi">("upi");

  // AutoPay State
  const [enableAutoPay, setEnableAutoPay] = useState(false);

  // Subscription Management State
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [autoPay, setAutoPay] = useState(true);

  // Developer VPA (User config)
  const DEVELOPER_VPA = "nalvazhuthi03-1@okhdfcbank";

  // Local data simulation
  const [transactions, setTransactions] = useState<any[]>(
    isPro
      ? [
          {
            id: 1,
            desc: "Pro Subscription (Monthly)",
            date: "Oct 24, 2024",
            amount: "₹199",
            status: "Paid",
          },
        ]
      : [],
  );

  const [paymentMethods, setPaymentMethods] = useState<any[]>(
    isPro
      ? [{ id: 1, type: "UPI AutoPay", last4: "nalv@oksbi", expiry: "Active" }]
      : [],
  );

  const handleStartUpgrade = () => {
    setIsCheckoutOpen(true);
    setCheckoutStep("method-selection");
  };

  const handleCancelSubscription = () => {
    // Simulate API verification
    setTimeout(() => {
      localStorage.setItem("isPro", "false");
      toast({
        title: "Subscription Cancelled",
        description: "You have been downgraded to the Free plan.",
      });
      window.location.reload(); // Reload to reflect changes in AuthContext
    }, 1000);
  };

  const processPayment = async () => {
    // UPI Logic Only

    setCheckoutStep("processing");

    // Simulate API delay
    setTimeout(async () => {
      try {
        await upgradeToPro();

        // Add mock transaction
        const newTx = {
          id: Date.now(),
          desc: `Pro Subscription (${billingCycle === "monthly" ? "Monthly" : "Yearly"})`,
          date: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          amount: billingCycle === "monthly" ? "₹199" : "₹1999",
          status: "Paid",
        };
        setTransactions([newTx, ...transactions]);

        // Add mock method if empty
        if (paymentMethods.length === 0) {
          setPaymentMethods([
            {
              id: Date.now(),
              type: "UPI",
              last4: "user@upi",
              expiry: enableAutoPay ? "AutoPay Active" : "One-time",
            },
          ]);
        }

        setCheckoutStep("success");
        toast({
          title: "Payment Verified! 🎉",
          description: "Amount received. Your Pro subscription is active.",
          duration: 5000,
        });
      } catch (e) {
        setCheckoutStep("upi-scan");
        toast({
          title: "Verification Failed",
          description: "Could not verify transaction. Please try again.",
          variant: "destructive",
        });
      }
    }, 4000); // Increased delay for "realism"
  };

  const closeCheckout = () => {
    setIsCheckoutOpen(false);
    setCheckoutStep("method-selection");
    // Clear form (optional)
  };

  // Calculate Amount
  const amount = billingCycle === "monthly" ? 199 : 1999;

  // TEST MODE: Fixed amount of 1 INR
  const amountINR = "1.00";

  const upiLink = `upi://pay?pa=${DEVELOPER_VPA}&pn=SpanTrackerPro&am=${amountINR}&cu=INR`;

  const features = [
    { name: "Unlimited Tasks & History", free: true, pro: true },
    { name: "Basic Statistics", free: true, pro: true },
    { name: "Weekly Reviews", free: false, pro: true },
    { name: "Advanced Analytics", free: false, pro: true },
    { name: "Cloud Sync", free: false, pro: true },
    { name: "Custom Themes", free: false, pro: true },
    { name: "Priority Support", free: false, pro: true },
  ];

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Upgrade Your Productivity
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get the most out of your day with advanced features, unlimited
            history, and powerful analytics.
          </p>
        </div>

        <Tabs defaultValue="plans" className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="grid w-[400px] grid-cols-3">
              <TabsTrigger value="plans">Plans</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="payment-methods">Methods</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="plans" className="space-y-6">
            <div className="flex justify-center items-center gap-4 mb-8">
              <span
                className={`text-sm font-medium ${billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground"}`}
              >
                Monthly
              </span>
              <div
                className="h-6 w-12 bg-muted rounded-full p-1 cursor-pointer relative"
                onClick={() =>
                  setBillingCycle((prev) =>
                    prev === "monthly" ? "yearly" : "monthly",
                  )
                }
              >
                <div
                  className={`h-4 w-4 rounded-full bg-primary transition-all duration-300 ${billingCycle === "yearly" ? "translate-x-6" : ""}`}
                />
              </div>
              <span
                className={`text-sm font-medium ${billingCycle === "yearly" ? "text-foreground" : "text-muted-foreground"}`}
              >
                Yearly{" "}
                <span className="text-xs text-primary font-bold ml-1">
                  SAVE 20%
                </span>
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Plan */}
              <Card
                className={`relative overflow-hidden border-2 transition-all duration-300 ${!isPro ? "border-primary/50 shadow-lg" : "border-border"}`}
              >
                {!isPro && (
                  <div className="absolute top-0 right-0 bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-bl-lg">
                    CURRENT PLAN
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">Free</CardTitle>
                  <CardDescription>
                    Essential features for daily tracking
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">₹0</span>
                    <span className="text-muted-foreground">/ forever</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div
                          className={`rounded-full p-1 ${feature.free ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}
                        >
                          <Check className="h-3 w-3" />
                        </div>
                        <span
                          className={
                            feature.free
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }
                        >
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline" disabled={true}>
                    {isPro ? "Downgrade" : "Current Plan"}
                  </Button>
                </CardFooter>
              </Card>

              {/* Pro Plan */}
              <Card
                className={`relative overflow-hidden border-2 transition-all duration-300 ${isPro ? "border-primary shadow-lg ring-1 ring-primary/50 scale-[1.02]" : "border-border hover:border-primary/50"}`}
              >
                {isPro && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                    ACTIVE
                  </div>
                )}
                {!isPro && (
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
                )}

                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl flex items-center gap-2">
                        Pro <Sparkles className="h-5 w-5 text-primary" />
                      </CardTitle>
                      <CardDescription>
                        Power features for serious productivity
                      </CardDescription>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">
                      {billingCycle === "monthly" ? "₹199" : "₹1999"}
                    </span>
                    <span className="text-muted-foreground">
                      /{billingCycle === "monthly" ? "mo" : "yr"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div
                          className={`rounded-full p-1 ${feature.pro ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                        >
                          <Check className="h-3 w-3" />
                        </div>
                        <span className="font-medium">{feature.name}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {isPro ? (
                    <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full" variant="outline">
                          Manage Subscription
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Manage Pro Subscription</DialogTitle>
                          <DialogDescription>
                            Review and modify your subscription details.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-6">
                          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                            <div className="space-y-1">
                              <p className="font-medium">Current Plan</p>
                              <p className="text-sm text-muted-foreground">
                                Pro Plan ({billingCycle})
                              </p>
                            </div>
                            <Badge>Active</Badge>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label className="text-base">Autopay</Label>
                              <p className="text-sm text-muted-foreground">
                                Automatically renew subscription
                              </p>
                            </div>
                            <Switch
                              checked={autoPay}
                              onCheckedChange={setAutoPay}
                            />
                          </div>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" className="w-full">
                                Cancel Subscription
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you absolutely sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. You will lose
                                  access to all Pro features immediately.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleCancelSubscription}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Confirm Cancellation
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <Button
                      className="w-full bg-primary hover:bg-primary/90"
                      onClick={handleStartUpgrade}
                    >
                      Upgrade to Pro
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="billing" className="space-y-4 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" /> Billing History
                </CardTitle>
                <CardDescription>
                  View your past invoices and transactions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length > 0 ? (
                  <div className="space-y-4">
                    {transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Zap className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{tx.desc}</p>
                            <p className="text-sm text-muted-foreground">
                              {tx.date}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{tx.amount}</p>
                          <Badge
                            variant="outline"
                            className="text-green-600 border-green-200 bg-green-50"
                          >
                            {tx.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <History className="h-12 w-12 mb-4 opacity-20" />
                    <p>No billing history available.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent
            value="payment-methods"
            className="space-y-4 max-w-4xl mx-auto"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" /> Payment Methods
                </CardTitle>
                <CardDescription>
                  Manage your saved payment cards.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  {paymentMethods.length > 0 ? (
                    <div className="space-y-4">
                      {paymentMethods.map((method) => (
                        <div
                          key={method.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-12 bg-slate-800 text-white rounded flex items-center justify-center font-bold text-xs">
                              UPI
                            </div>
                            <div className="text-left">
                              <p className="font-medium">
                                {method.type}: {method.last4}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Status: {method.expiry}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" className="gap-2 w-full mt-4">
                        <CreditCard className="h-4 w-4" /> Add Another Card
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        No payment methods added yet.
                      </p>
                      <Button variant="outline" className="gap-2 w-full mt-4">
                        <Smartphone className="h-4 w-4" /> Add Another UPI ID
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Checkout Dialog */}
        <Dialog
          open={isCheckoutOpen}
          onOpenChange={(open) => {
            if (!open && checkoutStep !== "processing") closeCheckout();
          }}
        >
          <DialogContent className="sm:max-w-md">
            {checkoutStep === "method-selection" && (
              <>
                <DialogHeader>
                  <DialogTitle>Select Payment Method</DialogTitle>
                  <DialogDescription>
                    Choose how you want to pay for Pro (
                    {billingCycle === "monthly" ? "₹199/mo" : "₹1999/yr"}).
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div
                    className={`flex items-center gap-4 border rounded-lg p-4 cursor-pointer transition-all ${selectedMethod === "upi" ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted"}`}
                    onClick={() => setSelectedMethod("upi")}
                  >
                    <Smartphone className="h-6 w-6 text-primary" />
                    <div>
                      <p className="font-medium">UPI / GPay / PhonePe</p>
                      <p className="text-xs text-muted-foreground">
                        Scan QR to pay directly
                      </p>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCheckoutOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={() => setCheckoutStep("upi-scan")}>
                    Continue
                  </Button>
                </DialogFooter>
              </>
            )}

            {checkoutStep === "upi-scan" && (
              <>
                <DialogHeader>
                  <DialogTitle>Scan to Pay</DialogTitle>
                  <DialogDescription>
                    Scan this QR code with any UPI app (GPay, PhonePe, Paytm).
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center py-4 space-y-4">
                  <div className="bg-white p-4 rounded-xl border shadow-sm">
                    <QRCode
                      value={upiLink}
                      size={180}
                      style={{
                        height: "auto",
                        maxWidth: "100%",
                        width: "100%",
                      }}
                      viewBox={`0 0 256 256`}
                    />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-lg">₹{amountINR}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Paying: {DEVELOPER_VPA}
                    </p>
                  </div>
                  <div className="flex gap-2 text-xs text-muted-foreground bg-muted p-2 rounded w-full justify-center">
                    <Smartphone className="h-4 w-4" />
                    <span>GPay</span>
                    <span className="mx-1">•</span>
                    <span>PhonePe</span>
                    <span className="mx-1">•</span>
                    <span>Paytm</span>
                  </div>

                  <div className="flex items-center justify-between w-full border p-3 rounded-lg bg-muted/20">
                    <div className="space-y-0.5 text-left">
                      <Label
                        className="text-base cursor-pointer"
                        htmlFor="autopay-switch"
                      >
                        Enable Auto Pay
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Automatically renew subscription using UPI eMandate
                      </p>
                    </div>
                    <Switch
                      id="autopay-switch"
                      checked={enableAutoPay}
                      onCheckedChange={setEnableAutoPay}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setCheckoutStep("method-selection")}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={processPayment}
                    className="gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4" /> Verify Payment
                  </Button>
                </DialogFooter>
              </>
            )}

            {checkoutStep === "processing" && (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <div className="text-center space-y-1">
                  <p className="text-lg font-medium">
                    Verifying Transaction...
                  </p>
                  <p className="text-sm text-muted-foreground animate-pulse">
                    Checking status with bank server...
                  </p>
                </div>
              </div>
            )}

            {checkoutStep === "success" && (
              <div className="flex flex-col items-center justify-center py-6 space-y-4 text-center">
                <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2 animate-in zoom-in duration-300">
                  <Check className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold">Payment Received!</h2>
                <p className="text-muted-foreground px-4">
                  Thank you for your purchase. Your account has been instantly
                  upgraded to Pro.
                </p>
                <Button className="w-full mt-4" onClick={closeCheckout}>
                  Start Using Pro Features
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Payments;
