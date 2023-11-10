import { GetServerSideProps } from 'next';
import NFTCard from '../components/NFTCard';
import NFT from '../types/nft';
import NFTs from '../pages/api/nfts';

interface NFTsPageProps {
    nfts: NFT[];
  }
  
const NFTsPage: React.FC<NFTsPageProps> = ({ nfts }) => {
    return <NFTs nfts={nfts} />;
  };
  export const getServerSideProps: GetServerSideProps = async () => {
    const res = await fetch('http://localhost:3000/api/nfts');
    const nfts: NFT[] = await res.json();
  
    return {
      props: {
        nfts,
      },
    };
  };

export default NFTCard;
