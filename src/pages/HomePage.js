import { HeroSlider } from '../components/HeroSlider';
import { AnimeRow } from '../components/AnimeRow';
import { Footer } from '../components/Footer';
import { getAnimeList, getAnimeByGenre, getAnimeTrend, getLatestAnimeList, getLastWatch } from '../services/api';
import { ShareBanner } from '../components/ShareBanner';
import { LatestEpisodesGrid } from '../components/LatestEpisodesGrid';
import { HomeSidebar } from '../components/HomeSidebar';

export function HomePage() {
  return (
    <div className="page" id="home-page">
      <div className="home-top">
        <div className="home-hero-main">
          <HeroSlider />
          <AnimeRow
            title='🔥 <span>Continue Watching</span> ...'
            fetchPage={() => getLastWatch()}
            categoryKey="Continue"
          />
          <AnimeRow
            title='🔥 <span>Trending</span> Anime'
            fetchPage={(page, pageSize) => getAnimeTrend(page, pageSize)}
            categoryKey="trending"
          />
          {/* <AnimeRow
            title='Latest <span>Episodes</span>'
            fetchPage={(page, pageSize) => getAnimeList(page, pageSize)}
            categoryKey="popular"
          /> */}
          <LatestEpisodesGrid compact />
        </div>
        <HomeSidebar />
      </div>
      <ShareBanner />
      <Footer />
    </div>
  );
}
