import './styles/styles.css'
import GamePage from './pages/GamePage'
import {useEffect, useState} from "react";
import "./App.css"
import KukuPoster from './assets/svg/kukuDanger.png'
import Greatechlg from './assets/svg/greatech_logo.png'
import {VEHICLE_TYPES} from './game/Vehicles/vehicleTypes.ts'
import {chickenUrl} from './game/Chicken/ChickenModel.tsx'
import {preloadSky} from './game/Scene/skyAsset.ts'
import {preloadVegetation} from './game/Environment/Vegetation.tsx'



function App() {
    const [progressKuku, setProgressKuku] =  useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const kukuImageModules = import.meta.glob('./assets/svg/*.{png, jpg, jpeg, webp, svg}',{
            eager: true,
            import: 'default',
        });

        const assetsKuku = Object.values(kukuImageModules) as string[];

        // Vehicle/chicken GLB URLs — fetched here too so the splash screen
        // doesn't dismiss until they're already in the browser's HTTP cache.
        // Trees go through preloadVegetation() instead (see Vegetation.tsx)
        // since their OBJ/MTL parse+materials-linking needs real loader
        // instances, not just a raw byte fetch.
        const sceneAssetUrls = [...VEHICLE_TYPES.map(t => t.modelUrl), chickenUrl];

        const loadImgKuku = (src: string) => {
            return new Promise<void>((resolve) => {
                const imgKuku = new Image();
                imgKuku.src = src;
                imgKuku.onload = imgKuku.onerror = () => resolve();
            });
        };

        // fetch() resolves once response headers arrive, not once the body
        // is fully downloaded — consuming .blob() forces the full transfer
        // to finish before this counts as "loaded".
        const loadSceneAsset = (src: string) => fetch(src).then(r => r.blob()).catch(() => {});

        const START = performance.now();
        const MIN_DELAY_MS = 5000;

        // Progress bar is paced to the 5s window itself, not to how many
        // assets happen to have resolved — ticks smoothly 0→100 regardless
        // of whether actual loading finishes early or late relative to it.
        const tick = setInterval(() => {
            const pct = Math.min(100, ((performance.now() - START) / MIN_DELAY_MS) * 100);
            setProgressKuku(pct);
        }, 50);

        const minDelay = new Promise<void>(resolve => setTimeout(resolve, MIN_DELAY_MS));

        Promise.all([
            minDelay,
            ...assetsKuku.map(loadImgKuku),
            ...sceneAssetUrls.map(loadSceneAsset),
            preloadSky(),
            preloadVegetation(),
        ]).then(() => {
            clearInterval(tick);
            setProgressKuku(100);
            setIsLoading(false);
        })

        return () => clearInterval(tick);
    }, []);
  return (
    <div>
        {isLoading ? (
            <div className="kuku-container">
            <div className="kuku-loader-container">
                <img src={KukuPoster} alt="Kuku poster" className="kuku-poster"/>
                <div className="kuku-loader">
                    <img src={Greatechlg} alt="Great Logo" className="kuku-great-logo"/>
                    <div className="kuku-loader-bar">
                        <div className="loader-bar" style={{width: `${progressKuku}%`}}></div>
                    </div>
                    <p>Loading .. {Math.round(progressKuku)}</p>
                </div>
            </div>
        </div>
            ) : (
            <GamePage/>
            )}

    </div>
  );
}

export default App
