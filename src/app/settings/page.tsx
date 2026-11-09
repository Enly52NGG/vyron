"use client";

import Link from "next/link";
import { Equalizer } from "@/components/equalizer/Equalizer";
import { useSettingsStore } from "@/store/settings-store";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";

export default function SettingsPage() {
  const settings = useSettingsStore();

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-white/50 text-sm mt-1">Настройки VYRON</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-sm font-medium text-white/60 uppercase tracking-wider">Appearance</h2>
        <GlassCard className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Тема</p>
              <p className="text-xs text-white/40">Сейчас доступна только тёмная</p>
            </div>
            <span className="text-sm text-white/70">Dark</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Интенсивность Blur</p>
            </div>
            <input
              type="range"
              min={12}
              max={40}
              value={settings.blurIntensity}
              onChange={(e) => settings.update({ blurIntensity: Number(e.target.value) })}
              className="w-32"
            />
          </div>
        </GlassCard>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-medium text-white/60 uppercase tracking-wider">Audio & Equalizer</h2>
        <Link href="/equalizer">
          <GlassCard hover className="p-5 flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-medium">Графический эквалайзер</p>
              <p className="text-xs text-white/40">10 полос • пресеты • реальное влияние на звук</p>
            </div>
            <span className="text-white/40">→</span>
          </GlassCard>
        </Link>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-medium text-white/60 uppercase tracking-wider">Playback</h2>
        <GlassCard className="p-5 space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm">Autoplay</span>
            <input
              type="checkbox"
              checked={settings.autoplay}
              onChange={(e) => settings.update({ autoplay: e.target.checked })}
              className="accent-white"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm">Gapless Playback</span>
            <input
              type="checkbox"
              checked={settings.gapless}
              onChange={(e) => settings.update({ gapless: e.target.checked })}
              className="accent-white"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm">Volume Normalization</span>
            <input
              type="checkbox"
              checked={settings.volumeNormalization}
              onChange={(e) => settings.update({ volumeNormalization: e.target.checked })}
              className="accent-white"
            />
          </label>
        </GlassCard>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-medium text-white/60 uppercase tracking-wider">Notifications</h2>
        <GlassCard className="p-5 space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm">Новые релизы любимых исполнителей</span>
            <input
              type="checkbox"
              checked={settings.notifications.newReleases}
              onChange={(e) =>
                settings.update({
                  notifications: { ...settings.notifications, newReleases: e.target.checked },
                })
              }
              className="accent-white"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm">Рекомендации</span>
            <input
              type="checkbox"
              checked={settings.notifications.recommendations}
              onChange={(e) =>
                settings.update({
                  notifications: { ...settings.notifications, recommendations: e.target.checked },
                })
              }
              className="accent-white"
            />
          </label>
        </GlassCard>
      </section>

      <div className="pt-4">
        <Button variant="secondary" onClick={() => settings.reset()}>
          Сбросить все настройки
        </Button>
      </div>
    </div>
  );
}
