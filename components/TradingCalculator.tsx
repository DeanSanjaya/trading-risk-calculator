"use client";

import React, { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { TrendingUp, TrendingDown, Copy, Check, RotateCcw, Plus, X, Calculator, AlertCircle, HelpCircle, Coins } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatPercent, formatDecimal } from "@/lib/utils";
import { CalculatorResults, TakeProfitTarget } from "@/types";

// Schema for form validation
const formSchema = z.object({
  position: z.enum(["LONG", "SHORT"]),
  currency: z.enum(["IDR", "USDT"]),
  accountBalance: z.number({ message: "Harus berupa angka" }).positive("Modal harus lebih besar dari 0"),
  riskPercentage: z.number({ message: "Harus berupa angka" }).positive("Risk harus lebih besar dari 0%").max(100, "Risk tidak boleh melebihi 100%"),
  entryPrice: z.number({ message: "Harus berupa angka" }).positive("Entry price harus lebih besar dari 0"),
  stopLoss: z.number({ message: "Harus berupa angka" }).positive("Stop Loss harus lebih besar dari 0"),
  leverage: z.number({ message: "Harus berupa angka" }).positive("Leverage harus lebih besar dari 0"),
});

type FormValues = z.infer<typeof formSchema>;

export default function TradingCalculator() {
  const [rrTargets, setRrTargets] = useState<number[]>([1, 1.5, 2, 3, 5]);
  const [customRr, setCustomRr] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [customRrError, setCustomRrError] = useState("");

  const defaultValues: FormValues = {
    position: "LONG",
    currency: "IDR",
    accountBalance: 0,
    riskPercentage: 0,
    entryPrice: 0,
    stopLoss: 0,
    leverage: 0,
  };

  const {
    register,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onChange",
  });

  // Watch form values for real-time calculations
  const formValues = useWatch({ control });
  const position = formValues.position || "LONG";
  const currency = formValues.currency || "IDR";
  const accountBalance = formValues.accountBalance ?? 0;
  const riskPercentage = formValues.riskPercentage ?? 0;
  const entryPrice = formValues.entryPrice ?? 0;
  const stopLoss = formValues.stopLoss ?? 0;
  const leverage = formValues.leverage ?? 0;

  // Custom position-based validation logic
  let positionError: string | null = null;
  if (entryPrice > 0 && stopLoss > 0) {
    if (position === "LONG" && stopLoss >= entryPrice) {
      positionError = "Stop Loss harus lebih kecil dari Entry";
    } else if (position === "SHORT" && stopLoss <= entryPrice) {
      positionError = "Stop Loss harus lebih besar dari Entry";
    }
  }

  // Perform trading calculations
  const calculateResults = (): CalculatorResults | null => {
    if (accountBalance <= 0 || riskPercentage <= 0 || entryPrice <= 0 || stopLoss <= 0 || leverage <= 0 || positionError !== null) {
      return null;
    }

    // Risk Money: Account Balance * (Risk % / 100)
    const riskMoney = accountBalance * (riskPercentage / 100);

    // Stop Loss Percentage: abs(Entry - Stop Loss) / Entry
    const stopLossPercentage = Math.abs(entryPrice - stopLoss) / entryPrice;

    if (stopLossPercentage === 0) return null;

    // Position Size: Risk Money / Stop Loss Percentage
    const positionSize = riskMoney / stopLossPercentage;

    // Required Margin: Position Size / Leverage
    const requiredMargin = positionSize / leverage;

    // Risk Distance (Jarak Risiko)
    const riskDistance = position === "LONG" ? entryPrice - stopLoss : stopLoss - entryPrice;

    // Calculate Take Profits dynamically
    const takeProfits: TakeProfitTarget[] = rrTargets
      .sort((a, b) => a - b)
      .map((rr) => {
        // TP Price: for LONG Entry + (Risk Distance * RR), for SHORT Entry - (Risk Distance * RR)
        const price = position === "LONG" ? entryPrice + riskDistance * rr : entryPrice - riskDistance * rr;
        // Potential Profit: Risk Money * RR
        const profit = riskMoney * rr;

        // RR Rating Badge logic
        let rating: "Poor" | "Good" | "Excellent" = "Good";
        if (rr < 1.5) {
          rating = "Poor";
        } else if (rr > 2.5) {
          rating = "Excellent";
        }

        return { rr, price, profit, rating };
      });

    return {
      riskMoney,
      stopLossPercentage,
      positionSize,
      requiredMargin,
      riskDistance,
      takeProfits,
    };
  };

  const results = calculateResults();

  // Handle adding custom RR target
  const handleAddCustomRr = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(customRr.replace(",", "."));
    if (isNaN(value)) {
      setCustomRrError("Masukkan angka yang valid");
      return;
    }
    if (value <= 0) {
      setCustomRrError("RR harus lebih besar dari 0");
      return;
    }
    if (rrTargets.includes(value)) {
      setCustomRrError("RR sudah ada di daftar");
      return;
    }

    setRrTargets((prev) => [...prev, value].sort((a, b) => a - b));
    setCustomRr("");
    setCustomRrError("");
  };

  // Remove RR target
  const handleRemoveRr = (value: number) => {
    setRrTargets((prev) => prev.filter((item) => item !== value));
  };

  // Reset all targets and form
  const handleResetAll = () => {
    reset(defaultValues);
    setRrTargets([1, 1.5, 2, 3, 5]);
    setCustomRr("");
    setCustomRrError("");
  };

  // Copy Results to Clipboard
  const handleCopyClipboard = () => {
    if (!results) return;

    const rrText = results.takeProfits.map((tp) => `- RR ${tp.rr}x (${tp.rating} RR) | TP Price: ${formatDecimal(tp.price)} | Est. Profit: ${formatCurrency(tp.profit, currency)}`).join("\n");

    const text = `--- TRADING RISK CALCULATOR SUMMARY ---
Posisi: ${position}
Mata Uang: ${currency}
Account Balance: ${formatCurrency(accountBalance, currency)}
Risk Per Trade: ${riskPercentage}% (${formatCurrency(results.riskMoney, currency)})
Leverage: ${leverage}x

[INFO INFO TRANSAKSI]
Entry Price: ${formatDecimal(entryPrice)}
Stop Loss: ${formatDecimal(stopLoss)}
Jarak Stop Loss: ${formatDecimal(results.riskDistance)} (${formatPercent(results.stopLossPercentage)})

[UKURAN POSISI & MARGIN]
Position Size: ${formatCurrency(results.positionSize, currency)}
Required Margin (Modal Terpakai): ${formatCurrency(results.requiredMargin, currency)}

[TARGET TAKE PROFIT]
${rrText}
----------------------------------------`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* COLUMN 1: INPUT FORM */}
      <div className="lg:col-span-5 space-y-6">
        <Card className="border-neutral-800">
          <CardHeader className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Calculator className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">Kalkulator Risiko</CardTitle>
                <CardDescription className="text-xs">Atur manajemen risiko perdagangan Anda</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Position & Currency Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Arah Posisi</Label>
                <div className="grid grid-cols-2 gap-2 bg-[#12161a] p-1 rounded-xl border border-neutral-800">
                  <Button
                    type="button"
                    variant={position === "LONG" ? "long" : "ghost"}
                    className="rounded-lg h-9 font-bold flex items-center justify-center space-x-1.5 transition-all"
                    onClick={() => setValue("position", "LONG")}
                  >
                    <TrendingUp className="h-4 w-4" />
                    <span>LONG / BELI</span>
                  </Button>
                  <Button
                    type="button"
                    variant={position === "SHORT" ? "short" : "ghost"}
                    className="rounded-lg h-9 font-bold flex items-center justify-center space-x-1.5 transition-all text-neutral-300"
                    onClick={() => setValue("position", "SHORT")}
                  >
                    <TrendingDown className="h-4 w-4" />
                    <span>SHORT / JUAL</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Mata Uang</Label>
                <div className="grid grid-cols-2 gap-2 bg-[#12161a] p-1 rounded-xl border border-neutral-800">
                  <Button
                    type="button"
                    variant={currency === "IDR" ? "default" : "ghost"}
                    className={`rounded-lg h-9 font-bold flex items-center justify-center space-x-1.5 transition-all ${currency === "IDR" ? "bg-amber-500 text-black hover:bg-amber-600" : "text-neutral-300"}`}
                    onClick={() => setValue("currency", "IDR")}
                  >
                    <span>IDR</span>
                  </Button>
                  <Button
                    type="button"
                    variant={currency === "USDT" ? "default" : "ghost"}
                    className={`rounded-lg h-9 font-bold flex items-center justify-center space-x-1.5 transition-all ${currency === "USDT" ? "bg-[#26a17b] text-white hover:bg-[#1f8766]" : "text-neutral-300"}`}
                    onClick={() => setValue("currency", "USDT")}
                  >
                    <span>USDT</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Inputs: Account Balance & Risk Percentage */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accountBalance">Modal Akun (Balance)</Label>
                <Input
                  id="accountBalance"
                  type="number"
                  prefixText={currency === "IDR" ? "Rp" : "$"}
                  {...register("accountBalance", { valueAsNumber: true })}
                />
                {errors.accountBalance && (
                  <p className="text-xs text-rose-500 flex items-center mt-1">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.accountBalance.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="riskPercentage">Risk Per Trade (%)</Label>
                <div className="flex gap-2">
                  <Input
                    id="riskPercentage"
                    type="number"
                    step="0.1"
                    suffix="%"
                    placeholder="1"
                    {...register("riskPercentage", { valueAsNumber: true })}
                  />
                </div>
                {/* Risk Quick Selection */}
                <div className="flex justify-between gap-1 mt-1">
                  {[0.5, 1, 2, 3, 5].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setValue("riskPercentage", pct, { shouldValidate: true })}
                      className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                        riskPercentage === pct ? "bg-amber-500/20 text-amber-400 border-amber-500/50" : "border-neutral-800 text-neutral-400 hover:bg-neutral-800 hover:text-white"
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
                {errors.riskPercentage && (
                  <p className="text-xs text-rose-500 flex items-center mt-1">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.riskPercentage.message}
                  </p>
                )}
              </div>
            </div>

            {/* Inputs: Entry Price & Stop Loss */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="entryPrice">Harga Entry</Label>
                <Input
                  id="entryPrice"
                  type="number"
                  step="any"
                  placeholder="50000"
                  {...register("entryPrice", { valueAsNumber: true })}
                />
                {errors.entryPrice && (
                  <p className="text-xs text-rose-500 flex items-center mt-1">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.entryPrice.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="stopLoss">Harga Stop Loss (SL)</Label>
                <Input
                  id="stopLoss"
                  type="number"
                  step="any"
                  placeholder="48000"
                  {...register("stopLoss", { valueAsNumber: true })}
                />
                {errors.stopLoss && (
                  <p className="text-xs text-rose-500 flex items-center mt-1">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.stopLoss.message}
                  </p>
                )}
                {positionError && (
                  <p className="text-xs text-rose-500 flex items-center mt-1 font-semibold animate-pulse">
                    <AlertCircle className="h-3.5 w-3.5 mr-1 shrink-0" />
                    {positionError}
                  </p>
                )}
              </div>
            </div>

            {/* Input: Leverage */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="leverage">Leverage</Label>
                <span className="text-xs font-bold text-amber-500">{leverage}x</span>
              </div>
              <Input
                id="leverage"
                type="number"
                suffix="x"
                placeholder="10"
                {...register("leverage", { valueAsNumber: true })}
              />
              <div className="flex justify-between gap-1 mt-1">
                {[1, 5, 10, 20, 50, 100].map((lev) => (
                  <button
                    key={lev}
                    type="button"
                    onClick={() => setValue("leverage", lev, { shouldValidate: true })}
                    className={`flex-1 text-[10px] py-1 rounded border transition-colors font-semibold ${
                      leverage === lev ? "bg-amber-500/20 text-amber-400 border-amber-500/50" : "border-neutral-800 text-neutral-400 hover:bg-neutral-800 hover:text-white"
                    }`}
                  >
                    {lev}x
                  </button>
                ))}
              </div>
              {errors.leverage && (
                <p className="text-xs text-rose-500 flex items-center mt-1">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.leverage.message}
                </p>
              )}
            </div>

            {/* Dynamic Risk Reward Target Selector */}
            <div className="space-y-3 pt-2 border-t border-neutral-800/80">
              <Label>Target Risk Reward (RR)</Label>
              <div className="flex flex-wrap gap-1.5 p-2 bg-[#12161a] rounded-lg border border-neutral-800">
                {rrTargets.length === 0 ? (
                  <span className="text-xs text-neutral-500 italic p-1">Belum ada target RR. Tambahkan di bawah.</span>
                ) : (
                  rrTargets.map((target) => (
                    <div
                      key={target}
                      className="inline-flex items-center bg-[#1e2329] border border-neutral-700 rounded-md py-1 pl-2.5 pr-1 text-xs text-neutral-200"
                    >
                      <span className="font-semibold">{target}x</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRr(target)}
                        className="ml-1.5 p-0.5 text-neutral-400 hover:text-rose-400 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add Custom RR input */}
              <form
                onSubmit={handleAddCustomRr}
                className="flex gap-2"
              >
                <div className="flex-1 relative">
                  <Input
                    type="text"
                    value={customRr}
                    onChange={(e) => {
                      setCustomRr(e.target.value);
                      if (customRrError) setCustomRrError("");
                    }}
                    placeholder="Contoh: 1.5, 2.5, 4"
                    className="h-9 text-xs"
                    suffix="x"
                  />
                </div>
                <Button
                  type="submit"
                  size="sm"
                  className="h-9 shrink-0 gap-1 bg-amber-500 text-[#12161a]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Tambah
                </Button>
              </form>
              {customRrError && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {customRrError}
                </p>
              )}

              {/* Predefined quick template additions */}
              <div className="flex gap-1.5 pt-1">
                {[1.5, 2, 2.5, 3, 4].map((rr) => (
                  <Button
                    key={rr}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-[10px] py-0 px-2 border-neutral-800 text-neutral-400 hover:text-amber-400"
                    onClick={() => {
                      if (!rrTargets.includes(rr)) {
                        setRrTargets((prev) => [...prev, rr].sort((a, b) => a - b));
                      }
                    }}
                  >
                    +{rr}x
                  </Button>
                ))}
              </div>
            </div>

            {/* Action Buttons: Reset & Clipboard */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-neutral-800">
              <Button
                type="button"
                variant="outline"
                onClick={handleResetAll}
                className="w-full flex items-center justify-center space-x-1.5 border-neutral-800 text-neutral-400 hover:bg-neutral-800/40 hover:text-white rounded-lg"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset Form</span>
              </Button>
              <Button
                type="button"
                onClick={handleCopyClipboard}
                disabled={!results}
                className={`w-full flex items-center justify-center space-x-1.5 rounded-lg font-bold text-xs ${results ? "bg-amber-500 text-[#12161a] hover:bg-amber-600" : "bg-neutral-800 text-neutral-500 cursor-not-allowed"}`}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span>Disalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Salin Hasil</span>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* COLUMN 2: CALCULATION RESULTS */}
      <div className="lg:col-span-7 space-y-6">
        {results ? (
          <div className="space-y-6">
            {/* Top Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Risk Summary Card */}
              <Card className="border-neutral-800 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                <CardHeader className="py-4">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-neutral-400">Ringkasan Risiko</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3.5 py-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-neutral-400">Modal Akun</span>
                    <span className="text-sm font-bold text-white">{formatCurrency(accountBalance, currency)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-neutral-400">Persentase Risiko</span>
                    <span className="text-sm font-bold text-amber-500">{riskPercentage}%</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-neutral-800/80 pt-3">
                    <span className="text-xs text-neutral-400 font-semibold">Uang Risiko (Risk Money)</span>
                    <span className="text-base font-black text-rose-400">{formatCurrency(results.riskMoney, currency)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Position Summary Card */}
              <Card className="border-neutral-800 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#0ecb81]" />
                <CardHeader className="py-4">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-neutral-400">Ringkasan Posisi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3.5 py-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-neutral-400">Ukuran Posisi (Size)</span>
                    <span className="text-sm font-bold text-white">{formatCurrency(results.positionSize, currency)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-neutral-400">Leverage</span>
                    <span className="text-sm font-bold text-neutral-300">{leverage}x</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-neutral-800/80 pt-3">
                    <span className="text-xs text-neutral-400 font-semibold">Margin yang Dibutuhkan</span>
                    <span className="text-base font-black text-[#0ecb81]">{formatCurrency(results.requiredMargin, currency)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Trade Summary (Full Width) */}
            <Card className="border-neutral-800 overflow-hidden relative">
              <div className={`absolute top-0 left-0 w-full h-1 ${position === "LONG" ? "bg-[#0ecb81]" : "bg-[#f6465d]"}`} />
              <CardHeader className="py-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-neutral-400">Detail Transaksi</CardTitle>
                  <Badge variant={position === "LONG" ? "success" : "destructive"}>{position === "LONG" ? "BULLISH / LONG" : "BEARISH / SHORT"}</Badge>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 text-center">
                <div className="bg-[#12161a] p-3 rounded-lg border border-neutral-800">
                  <p className="text-[10px] text-neutral-400 font-bold uppercase">Harga Entry</p>
                  <p className="text-sm font-bold text-white mt-1">{formatDecimal(entryPrice)}</p>
                </div>
                <div className="bg-[#12161a] p-3 rounded-lg border border-neutral-800">
                  <p className="text-[10px] text-neutral-400 font-bold uppercase">Harga Stop Loss</p>
                  <p className="text-sm font-bold text-white mt-1">{formatDecimal(stopLoss)}</p>
                </div>
                <div className="bg-[#12161a] p-3 rounded-lg border border-neutral-800">
                  <p className="text-[10px] text-neutral-400 font-bold uppercase">Jarak Risiko (SL)</p>
                  <p className="text-sm font-bold text-rose-400 mt-1">{formatDecimal(results.riskDistance)}</p>
                </div>
                <div className="bg-[#12161a] p-3 rounded-lg border border-neutral-800">
                  <p className="text-[10px] text-neutral-400 font-bold uppercase">Jarak Persen (SL)</p>
                  <p className="text-sm font-bold text-rose-400 mt-1">{formatPercent(results.stopLossPercentage)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Take Profit Target Table */}
            <Card className="border-neutral-800">
              <CardHeader className="border-b border-neutral-800/80">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-base font-bold">Target Take Profit (TP)</CardTitle>
                    <CardDescription className="text-xs">Harga target keluar berdasarkan rasio Risk Reward</CardDescription>
                  </div>
                  <Coins className="h-5 w-5 text-amber-500" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">Rasio RR</TableHead>
                      <TableHead>Harga TP</TableHead>
                      <TableHead>Estimasi Profit</TableHead>
                      <TableHead className="pr-6 text-right">Penilaian RR</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.takeProfits.map((tp) => (
                      <TableRow
                        key={tp.rr}
                        className="hover:bg-neutral-800/20"
                      >
                        <TableCell className="pl-6 font-bold text-white">{tp.rr}x</TableCell>
                        <TableCell className="font-semibold text-neutral-100">{formatDecimal(tp.price)}</TableCell>
                        <TableCell className="font-bold text-[#0ecb81]">+{formatCurrency(tp.profit, currency)}</TableCell>
                        <TableCell className="pr-6 text-right">
                          {tp.rating === "Excellent" && <Badge variant="success">Excellent RR</Badge>}
                          {tp.rating === "Good" && <Badge variant="warning">Good RR</Badge>}
                          {tp.rating === "Poor" && <Badge variant="destructive">Poor RR</Badge>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="border-neutral-800 h-full flex flex-col justify-center items-center p-8 py-16 text-center border-dashed bg-[#161a1e]/50">
            <div className="p-4 bg-neutral-800/55 rounded-full mb-4">
              <HelpCircle className="h-10 w-10 text-neutral-500" />
            </div>
            <CardTitle className="text-lg text-neutral-300">Menunggu Input Lengkap</CardTitle>
            <CardDescription className="max-w-xs mt-2 text-xs text-neutral-500">Silakan lengkapi atau perbaiki input formulir di sebelah kiri untuk melihat hasil perhitungan manajemen risiko.</CardDescription>
            {positionError && (
              <div className="mt-6 p-3 px-4 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-400 font-semibold flex items-center space-x-2 animate-bounce">
                <AlertCircle className="h-4 w-4" />
                <span>{positionError}</span>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
