import Link from "next/link";
import {
  MediaRenderer,
  useActiveListings,
  useContract,
} from "@thirdweb-dev/react";
import { useRouter } from "next/router";

const Home = () => {
  // Connect your marketplace smart contract here (replace this address)
const { contract } = useContract("<YOUR-CONTRACT-ADDRESS>", "marketplace")

  const { data: listings, isLoading: loadingListings } =
    useActiveListings(marketplace);

  return <div></div>;
};

export default Home;