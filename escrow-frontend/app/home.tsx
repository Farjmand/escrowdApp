// import Link from "next/link";
// import {
//   MediaRenderer,
//   useActiveListings,
//   useContract,
// } from "@thirdweb-dev/react";
// import { useRouter } from "next/router";

// const Home = () => {
//   // Connect your marketplace smart contract here (replace this address)
// const { contract } = useContract("<YOUR-CONTRACT-ADDRESS>", "marketplace")

//   const { data: listings, isLoading: loadingListings } =
//     useActiveListings(marketplace);

//     return (
//       <div>
//         {
//           // If the listings are loading, show a loading message
//           loadingListings ? (
//             <div>Loading listings...</div>
//           ) : (
//             // Otherwise, show the listings
//             <div>
//               {listings?.map((listing) => (
//                 <div
//                   key={listing.id}
//                   onClick={() => router.push(`/listing/${listing.id}`)}
//                 >
//                   <MediaRenderer src={listing.asset.image} />
//                   <h2>
//                     <Link href={`/listing/${listing.id}`}>
//                       <a>{listing.asset.name}</a>
//                     </Link>
//                   </h2>
    
//                   <p>
//                     <b>{listing.buyoutCurrencyValuePerToken.displayValue}</b>{" "}
//                     {listing.buyoutCurrencyValuePerToken.symbol}
//                   </p>
//                 </div>
//               ))}
//             </div>
//           )
//         }
//       </div>
//     );
// };

// export default Home;