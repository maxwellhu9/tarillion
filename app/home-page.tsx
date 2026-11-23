/**
 * Home page placeholder. Will become the Daily Heel game board.
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Subject } from "@/server/models/auth";

type HomePageProps = { user: Subject };
export default function HomePage({ user }: HomePageProps) {
  return (
    <div className="mx-auto w-full max-w-xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Daily Heel</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          Game board coming soon. Signed in as {user.id}.
        </CardContent>
      </Card>
    </div>
  );
}
