import PageInjector from "./background/PageInjector";
import { InjectTypes } from "./background/constants"

const injector = new PageInjector(1, InjectTypes.FixedPosition, ".o3j99")
injector.inject("<h1>Test</h1>")
