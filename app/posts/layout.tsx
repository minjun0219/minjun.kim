import Layout from "@/containers/Layout";

type Props = {
  children: React.ReactNode;
};

export default function ArticlesLayout({ children }: Props) {
  return <Layout>{children}</Layout>;
}
