import Layout from "@/components/Layout";

type Props = {
  children: React.ReactNode;
};

export default function ArticlesLayout({ children }: Props) {
  return <Layout>{children}</Layout>;
}
