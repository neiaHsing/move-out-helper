import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Box, PackageOpen } from "lucide-react";
import { publicBinsApi } from "@/lib/api";

export default function PublicBinView() {
  const { id = "" } = useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-bin-manifest", id],
    queryFn: () => publicBinsApi.getManifest(id),
    retry: false,
  });

  if (isLoading) {
    return <main className="min-h-screen flex items-center justify-center p-6 font-mono text-muted-foreground">正在读取箱内清单…</main>;
  }

  if (isError || !data) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 font-mono">
        <section className="w-full max-w-lg border-2 border-border bg-card p-7 text-center space-y-4">
          <Box className="mx-auto h-10 w-10 text-muted-foreground" />
          <h1 className="text-xl font-bold">无法读取箱内清单</h1>
          <p className="text-sm text-muted-foreground">二维码可能无效，或这个箱子已被删除。</p>
          <Link href="/" className="inline-block text-sm text-primary underline underline-offset-4">登录管理账号</Link>
        </section>
      </main>
    );
  }

  const totalQuantity = data.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <main className="min-h-screen bg-background p-4 md:p-8 font-mono">
      <section className="mx-auto max-w-3xl space-y-6">
        <header className="flex items-center gap-3 border-b-2 border-border pb-5">
          <div className="flex h-11 w-11 items-center justify-center bg-primary text-primary-foreground"><Box /></div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">搬家箱物品清单 · 只读</p>
            <h1 className="text-xl font-black tracking-tight">BOXTRACK</h1>
          </div>
        </header>

        <div className="border-2 border-border bg-card p-5 md:p-7">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">{data.roomName}</p>
          <h2 className="mt-2 break-words text-3xl font-black tracking-tight">{data.bin.name}</h2>
          {data.bin.description && <p className="mt-3 text-sm text-muted-foreground">{data.bin.description}</p>}
          <p className="mt-5 text-xs text-muted-foreground">{data.items.length} 种物品 · 共 {totalQuantity} 件</p>
        </div>

        <section aria-labelledby="items-heading" className="border-2 border-border bg-card">
          <h3 id="items-heading" className="border-b-2 border-border px-5 py-3 text-sm font-bold uppercase tracking-wider">箱内物品</h3>
          {data.items.length === 0 ? (
            <div className="flex items-center gap-3 p-6 text-sm text-muted-foreground">
              <PackageOpen className="h-5 w-5" />这个箱子目前没有记录物品。
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {data.items.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <p className="break-words font-bold">{item.name}</p>
                    {item.description && <p className="mt-1 whitespace-pre-wrap break-words text-sm text-muted-foreground">{item.description}</p>}
                  </div>
                  <span className="shrink-0 text-sm text-muted-foreground">× {item.quantity}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <footer className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
          <span>扫码查看 · 只读清单</span>
          <Link href="/" className="text-primary underline underline-offset-4">登录管理账号</Link>
        </footer>
      </section>
    </main>
  );
}
