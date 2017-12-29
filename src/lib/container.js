import { createContainer, Lifetime, ResolutionMode, asValue, asFunction, asClass } from 'awilix';
import { logger } from './logger';
import movieDbApi from '../lib/moviedb';
import database from '../lib/database';
import config from '../../config.json';
import recursiveDirectoryReader from './scanner/recursive-directory-reader';
import tnp from 'torrent-name-parser';
import epinfer from 'epinfer';
import libraryScanner from './scanner/library-scanner';
import movieScanner from './scanner/movie-scanner';
import episodeScanner from './scanner/episode-scanner';
import EventEmitter from 'events';
import camelCase from 'camel-case';
import ffmpeg from '@ffmpeg-installer/ffmpeg';
import ffprobe from '@ffprobe-installer/ffprobe';
import ffmpegApi from '../lib/ffmpeg';
import imageDownloader from 'image-downloader';
import basicStreamer from './streamer/basic-streamer';
import ffmpegStreamer from './streamer/ffmpeg-streamer';
import ffmpegHlsStreamer from './streamer/ffmpeg-hls-streamer';
import M3u8Generator from './streamer/m3u8-generator';
import fsExtra from 'fs-extra';
import path from 'path';

/**
 * Using Awilix, the following files and folders (glob patterns)
 * will be loaded.
 */
const modulesToLoad = [
    // Services should be scoped to the request.
    // This means that each request gets a separate instance
    // of a service.
    ['services/*.js', Lifetime.SCOPED],
    ['lib/extended-info-providers/*-provider.js', Lifetime.SINGLETON],
    // Stores will be singleton (1 instance per process).
    // This is just for demo purposes, you can do whatever you want.
    ['stores/*.js', Lifetime.SINGLETON]
];

/**
 * Configures a new container.
 *
 * @return {Object} The container.
 */
export async function configureContainer() {
    const opts = {
        // Classic means Awilix will look at function parameter
        // names rather than passing a Proxy.
        resolutionMode: ResolutionMode.CLASSIC
    };
    // @todo create a bootstrap sequence
    const dataFolder = config.data_folder || path.join(process.env.HOME, '.media_speed');

    const imagesFolder = path.join(dataFolder, 'cache', 'images');
    const transcodingTempFolder = path.join(dataFolder, 'cache', 'transcoding_temp');
    await fsExtra.ensureDir(dataFolder);
    await fsExtra.ensureDir(imagesFolder);
    await fsExtra.ensureDir(transcodingTempFolder);

    const db = await database(dataFolder);

    const container = createContainer(opts)
        .loadModules(modulesToLoad, {
            // `modulesToLoad` paths should be relative
            // to this file's parent directory.
            cwd: `${__dirname}/..`,
            // Example: registers `services/todo-service.js` as `todoService`
            formatName: 'camelCase'
        })
        .register('logger', asValue(logger))
        .register('movieDbApi', asFunction(movieDbApi).singleton())
        .register('db', await asValue(db))
        .register('libraryScanner', asClass(libraryScanner).singleton())
        .register('movieScanner', asClass(movieScanner))
        .register('episodeScanner', asClass(episodeScanner))
        .register('directoryScanner', asClass(recursiveDirectoryReader)) // Replace something that will retreive only new files
        .register('movieNameExtractor', asValue({ extract: tnp }))
        .register('episodeNameExtractor', asValue({ extract: episode => epinfer.process(episode).getData() }))
        .register('eventEmitter', asClass(EventEmitter).singleton())
        .register('ffmpeg', asValue(ffmpeg))
        .register('ffprobe', asValue(ffprobe))
        .register('ffmpegApi', asFunction(ffmpegApi))
        .register('imageDownloader', asValue(imageDownloader))
        .register('m3u8Generator', asClass(M3u8Generator))
        .register('ffmpegStreamer', asClass(ffmpegStreamer))
        .register('ffmpegHlsStreamer', asClass(ffmpegHlsStreamer).singleton())
        .register('basicStreamer', asClass(basicStreamer))

        // Config Elements
        .register('movieDbApiKey', asValue(config.moviedb_api_key))
        .register('dataFolder', asValue(dataFolder))
        .register('imageDestinationFolder', asValue(imagesFolder))
        .register('transcodingTempFolder', asValue(transcodingTempFolder));

    // Bootstrap info Providers so they can use the events at any time
    const result = container.listModules(['./lib/extended-info-providers/*.js'], { cwd: `${__dirname}/..` });
    result.forEach(result => container.resolve(camelCase(result.name)));

    return container;
}
