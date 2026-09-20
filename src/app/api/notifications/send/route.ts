import { NextRequest, NextResponse } from "next/server";
import { broadcastPushNotification, type PushPayload } from "@/lib/pushSubscriptionStore";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PushPayload;

    if (!body.title || !body.body) {
      return NextResponse.json(
        { error: "Title and body are required for notification" },
        { status: 400 }
      );
    }

    const result = await broadcastPushNotification({
      title: body.title,
      body: body.body,
      url: body.url || "/market-prices",
      tag: body.tag || "agripredict-push",
      icon: body.icon || "/favicon.ico",
      badge: body.badge || "/favicon.ico"
    });

    return NextResponse.json({
      success: true,
      deliveredTo: result.sent,
      totalSubscribers: result.totalSubscribers,
      failed: result.failed,
      message:
        result.totalSubscribers === 0
          ? "No active push subscribers yet. Click 'Enable Notifications' in AgriPredict to register this device!"
          : `Push notification dispatched to ${result.sent} subscriber(s)!`
    });
  } catch (err: any) {
    console.error("Error sending push notification:", err);
    return NextResponse.json(
      { error: err.message || "Failed to broadcast notification" },
      { status: 500 }
    );
  }
}
