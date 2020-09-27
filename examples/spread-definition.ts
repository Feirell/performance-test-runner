import {defaultTestRunner} from '../src/performance-test-runner';
import {runAndReport} from "../src/suite-console-printer";

import 'test-for-feature-a';
import 'test-for-feature-b';
import 'test-for-feature-c';

runAndReport(defaultTestRunner);