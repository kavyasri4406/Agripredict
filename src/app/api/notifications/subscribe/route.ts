import { NextRequest, NextResponse } from "next/server";
import {
  saveSubscription,
  removeSubscription,
  getAllSubscriptions,
  type PushSubscriptionData
} from "@/lib/pushSubscriptionStore";

export async function GET() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "BLy4eqWH8LXxPSm0yrV27MftxuZEJ8IpUY_7X_j-ZQkUwFVMPqk_9E1AxmOWFfb2pNeEDjNbyLuDvtRJPm1Eem8";
  const subs = getAllSubscriptions();

  return NextResponse.json({
    publicKey,
    activeSubscribers: subs.length,
    status: "online"
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subscription, userAgent } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { error: "Invalid subscription payload" },
        { status: 400 }
      );
    }

    const subData: PushSubscriptionData = {
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      expirationTime: subscription.expirationTime,
      userAgent: userAgent || req.headers.get("user-agent") || ""
    };

    const saved = saveSubscription(subData);
    if (!saved) {
      return NextResponse.json(
        { error: "Failed to persist subscription" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Push notification subscription registered successfully!"
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { endpoint } = await req.json();
    if (!endpoint) {
      return NextResponse.json({ error: "Endpoint required" }, { status: 400 });
    }

    removeSubscription(endpoint);
    return NextResponse.json({ success: true, message: "Subscription removed" });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
