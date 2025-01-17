/* eslint no-use-before-define: 0 */ // --> OFF

"use client";

import { useCallback, useEffect, useMemo } from "react";
import { notFound, useRouter } from "next/navigation";
import {
  TransactionActionType,
  bexAbi,
  usePoolUserPosition,
  type Token,
} from "@bera/berajs";
import { getWithdrawLiquidityPayload } from "@bera/berajs/actions";
import { cloudinaryUrl, crocDexAddress } from "@bera/config";
import {
  ActionButton,
  FormattedNumber,
  InfoBoxList,
  InfoBoxListItem,
  PreviewToken,
  TokenIcon,
  TokenList,
  TxnPreview,
  useSlippage,
  useTxn,
} from "@bera/shared-ui";
import { cn } from "@bera/ui";
import { Button } from "@bera/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@bera/ui/card";
import { Icons } from "@bera/ui/icons";
import { Slider } from "@bera/ui/slider";
import { usePublicClient } from "wagmi";

import { SettingsPopover } from "~/components/settings-popover";
import { getPoolUrl } from "../pools/fetchPools";
import { useWithdrawLiquidity } from "./useWithdrawLiquidity";
import { useSelectedPool } from "~/hooks/useSelectedPool";
import { Address } from "viem";
import { Skeleton } from "@bera/ui/skeleton";

interface ITokenSummary {
  title: string;
  baseToken: Token | undefined;
  quoteToken: Token | undefined;
  baseAmount: string;
  quoteAmount: string;
  isLoading: boolean;
}
const TokenSummary = ({
  title,
  baseToken,
  quoteToken,
  baseAmount,
  quoteAmount,
  isLoading,
}: ITokenSummary) => {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-3 rounded-lg bg-muted p-3">
      <p className="w-full text-left text-lg font-semibold">{title}</p>
      <div className="flex w-full flex-row items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Pooled {isLoading ? "..." : baseToken?.symbol}
        </p>
        <div className="flex flex-row items-center gap-1 font-medium">
          {isLoading ? "..." : baseAmount}{" "}
          <TokenIcon address={baseToken?.address} symbol={baseToken?.symbol} />
        </div>
      </div>
      <div className="flex w-full flex-row items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Pooled {isLoading ? "..." : quoteToken?.symbol}
        </p>
        <div className="flex flex-row items-center gap-1 font-medium">
          {isLoading ? "..." : quoteAmount}{" "}
          <TokenIcon
            address={quoteToken?.address}
            symbol={quoteToken?.symbol}
          />
        </div>{" "}
      </div>
    </div>
  );
};

export default function WithdrawLiquidityContent({
  shareAddress,
}: {
  shareAddress: Address;
}) {
  const { data: pool, isLoading } = useSelectedPool(shareAddress);
  useEffect(() => {
    if (!pool && !isLoading) {
      notFound();
    }
  }, [pool, isLoading]);

  const reset = () => {
    setPreviewOpen(false);
    setAmount(0);
  };

  const router = useRouter();

  const { amount, setAmount, previewOpen, setPreviewOpen, poolPrice } =
    useWithdrawLiquidity(pool);

  const slippage = useSlippage();

  const baseToken = pool?.baseInfo;
  const quoteToken = pool?.quoteInfo;

  const {
    data: userPositionBreakdown,
    isLoading: isPositionBreakdownLoading,
    refresh,
  } = usePoolUserPosition({ pool });

  const baseAmountWithdrawn = useMemo(() => {
    if (!userPositionBreakdown || amount === 0) {
      return 0;
    }
    const bnAmountWithdrawn = userPositionBreakdown.baseAmount
      .times(amount)
      .div(100);
    return bnAmountWithdrawn.div(10 ** (baseToken?.decimals ?? 18)).toString();
  }, [userPositionBreakdown?.baseAmount, amount]);

  const quoteAmountWithdrawn = useMemo(() => {
    if (!userPositionBreakdown || amount === 0) {
      return 0;
    }
    const bnAmountWithdrawn = userPositionBreakdown.quoteAmount
      .times(amount)
      .div(100);
    return bnAmountWithdrawn.div(10 ** (quoteToken?.decimals ?? 18)).toString();
  }, [userPositionBreakdown?.quoteAmount, amount]);

  const totalHoneyPrice = useMemo(() => {
    return (
      Number(baseToken?.usdValue ?? 0) * Number(baseAmountWithdrawn) +
      Number(quoteToken?.usdValue ?? 0) * Number(quoteAmountWithdrawn)
    );
  }, [baseToken, quoteToken, baseAmountWithdrawn, quoteAmountWithdrawn]);

  const { write, ModalPortal } = useTxn({
    message: `Withdraw liquidity from ${pool?.poolName}`,
    onSuccess: () => {
      reset();
      refresh();
    },
    actionType: TransactionActionType.WITHDRAW_LIQUIDITY,
  });

  const client = usePublicClient();
  const handleWithdrawLiquidity = useCallback(async () => {
    try {
      const withdrawLiquidityRequest = await getWithdrawLiquidityPayload({
        args: {
          slippage: slippage ?? 0,
          poolPrice,
          baseToken,
          quoteToken,
          poolIdx: pool?.poolIdx,
          percentRemoval: amount,
          seeds: userPositionBreakdown?.seeds.toString() ?? "0",
          shareAddress: pool?.shareAddress,
        },
        publicClient: client,
      });

      write({
        address: crocDexAddress,
        abi: bexAbi,
        functionName: "userCmd",
        params: withdrawLiquidityRequest?.payload ?? [],
      });
    } catch (error) {
      console.error("Error creating pool:", error);
    }
  }, [
    amount,
    write,
    client,
    userPositionBreakdown,
    slippage,
    poolPrice,
    baseToken,
    quoteToken,
  ]);

  const notDeposited =
    userPositionBreakdown === undefined ||
    userPositionBreakdown?.formattedBaseAmount === "0" ||
    userPositionBreakdown?.formattedQuoteAmount === "0";
  return (
    <div className="mt-16 flex w-full flex-col items-center justify-center gap-4">
      {ModalPortal}
      <Card className="mx-6 w-full items-center bg-background p-4 sm:mx-0 sm:w-[480px] flex flex-col">
        {isLoading ? (
          <Skeleton className="h-8 w-40 self-center" />
        ) : (
          <p className="text-center text-2xl font-semibold">{pool?.poolName}</p>
        )}
        <div className="flex w-full flex-row items-center justify-center rounded-lg p-4">
          {isLoading ? (
            <Skeleton className="h-12 w-24" />
          ) : (
            pool?.tokens?.map((token, i) => {
              return (
                <TokenIcon
                  address={token.address}
                  symbol={token.symbol}
                  className={cn("h-12 w-12", i !== 0 && "ml-[-16px]")}
                  key={token.address}
                />
              );
            })
          )}
        </div>
        <div
          onClick={() => router.push(getPoolUrl(pool))}
          className="flex items-center justify-center text-sm font-normal leading-tight text-muted-foreground hover:cursor-pointer hover:underline"
        >
          View Pool Details
          <Icons.arrowRight className="W-4 h-4" />
        </div>
      </Card>
      <Card className="mx-6 w-full sm:w-[480px] md:mx-0 ">
        <CardHeader>
          <CardTitle className="center flex justify-between font-bold">
            Withdraw Liquidity
            <SettingsPopover />
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <TokenSummary
            title="Your Tokens In the Pool"
            baseToken={baseToken}
            quoteToken={quoteToken}
            baseAmount={userPositionBreakdown?.formattedBaseAmount ?? "0"}
            quoteAmount={userPositionBreakdown?.formattedQuoteAmount ?? "0"}
            isLoading={isPositionBreakdownLoading}
          />
          <div className="w-full rounded-lg border p-4">
            <div className="flex w-full flex-row items-center justify-between gap-1">
              <p className="text-sm font-semibold sm:text-lg">
                {amount.toFixed(2)}%
              </p>
              <div className="flex flex-row gap-2">
                {[25, 50, 75, 100].map((percent) => {
                  return (
                    <Button
                      key={percent.toString()}
                      variant={"secondary"}
                      disabled={notDeposited}
                      size={"sm"}
                      className="w-full text-foreground"
                      onClick={() => setAmount(percent)}
                    >
                      {percent.toString()}%
                    </Button>
                  );
                })}
              </div>
            </div>
            <Slider
              defaultValue={[0]}
              value={[amount]}
              disabled={notDeposited}
              max={100}
              min={0}
              onValueChange={(value: number[]) => {
                setAmount(value[0] ?? 0);
              }}
            />
          </div>
          <InfoBoxList>
            <InfoBoxListItem
              title={`Removing ${isLoading ? "..." : baseToken?.symbol}`}
              value={
                <div className="flex flex-row items-center justify-end gap-1">
                  <FormattedNumber
                    value={baseAmountWithdrawn}
                    compact={false}
                  />
                  <TokenIcon
                    address={baseToken?.address}
                    size={"md"}
                    symbol={baseToken?.symbol}
                  />
                </div>
              }
            />
            <InfoBoxListItem
              title={`Removing ${isLoading ? "..." : quoteToken?.symbol}`}
              value={
                <div className="flex flex-row items-center justify-end gap-1">
                  <FormattedNumber
                    value={quoteAmountWithdrawn}
                    compact={false}
                  />
                  <TokenIcon
                    address={quoteToken?.address}
                    size={"md"}
                    symbol={quoteToken?.symbol}
                  />
                </div>
              }
            />
            <InfoBoxListItem
              title={"Pool Price"}
              value={
                poolPrice ? (
                  <>
                    <FormattedNumber
                      value={poolPrice}
                      symbol={baseToken?.symbol}
                    />{" "}
                    = 1 {quoteToken?.symbol}
                  </>
                ) : (
                  "-"
                )
              }
            />
            <InfoBoxListItem
              title={"Estimated Value"}
              value={
                <FormattedNumber
                  value={totalHoneyPrice}
                  symbol="USD"
                  compact={false}
                />
              }
            />
            <InfoBoxListItem title={"Slippage"} value={`${slippage}%`} />
          </InfoBoxList>
          <TxnPreview
            open={previewOpen}
            title={"Confirm LP Withdrawal Details"}
            imgURI={`${cloudinaryUrl}/placeholder/preview-swap-img_ucrnla`}
            triggerText={"Preview"}
            setOpen={setPreviewOpen}
            disabled={
              amount === 0 ||
              isPositionBreakdownLoading ||
              userPositionBreakdown === undefined ||
              userPositionBreakdown.baseAmount.toString() === "0" ||
              userPositionBreakdown.quoteAmount.toString() === "0"
            }
          >
            <TokenList className="divide-muted bg-muted">
              <PreviewToken
                key={baseToken?.address}
                token={baseToken}
                value={Number(baseAmountWithdrawn)}
                price={Number(baseToken?.usdValue ?? 0)}
              />
              <PreviewToken
                key={quoteToken?.address}
                token={quoteToken}
                value={Number(quoteAmountWithdrawn)}
                price={Number(quoteToken?.usdValue ?? 0)}
              />
            </TokenList>
            <InfoBoxList>
              <InfoBoxListItem
                title={"Pool Price"}
                value={
                  poolPrice ? (
                    <>
                      <FormattedNumber
                        value={poolPrice}
                        symbol={baseToken?.symbol}
                      />{" "}
                      = 1 {quoteToken?.symbol}
                    </>
                  ) : (
                    "-"
                  )
                }
              />
              <InfoBoxListItem
                title={"Estimated Value"}
                value={
                  <FormattedNumber
                    value={totalHoneyPrice}
                    symbol="USD"
                    compact={false}
                  />
                }
              />
              <InfoBoxListItem title={"Slippage"} value={`${slippage}%`} />
            </InfoBoxList>
            <ActionButton>
              <Button
                className="w-full"
                onClick={() => handleWithdrawLiquidity()}
              >
                Withdraw Liquidity
              </Button>
            </ActionButton>
          </TxnPreview>
        </CardContent>
      </Card>
    </div>
  );
}
