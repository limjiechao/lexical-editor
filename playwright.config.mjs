/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {defineConfig, devices} from '@playwright/test';

import {
  getTestProfile,
  TEST_PROFILE_01_C_SR_M_LD,
  TEST_PROFILE_02_C_SP_M_LD,
  TEST_PROFILE_03_C_CR_M_LD,
  TEST_PROFILE_04_W_SR_M_LD,
  TEST_PROFILE_05_W_SP_M_LD,
  TEST_PROFILE_06_W_CR_M_LD,
  TEST_PROFILE_07_F_SR_M_LD,
  TEST_PROFILE_08_F_SP_M_LD,
  TEST_PROFILE_09_F_CR_M_LD,
  TEST_PROFILE_10_C_SR_L_LD,
  TEST_PROFILE_11_C_CR_L_LD,
  TEST_PROFILE_12_W_SR_L_LD,
  TEST_PROFILE_13_W_CR_L_LD,
  TEST_PROFILE_14_F_SR_L_LD,
  TEST_PROFILE_15_F_CR_L_LD,
} from './playwright.test-profiles.mjs';

const {CI} = process.env;
const IS_CI = CI === 'true';

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = defineConfig({
  forbidOnly: IS_CI,
  projects: [
    {
      name: TEST_PROFILE_01_C_SR_M_LD,
      testDir: './__tests__/',
      use: {
        ...devices['Desktop Chrome'],
        ...getTestProfile(TEST_PROFILE_01_C_SR_M_LD),
      },
    },
    {
      name: TEST_PROFILE_02_C_SP_M_LD,
      testDir: './__tests__/',
      use: {
        ...devices['Desktop Chrome'],
        ...getTestProfile(TEST_PROFILE_02_C_SP_M_LD),
      },
    },
    {
      name: TEST_PROFILE_03_C_CR_M_LD,
      testDir: './__tests__/',
      use: {
        ...devices['Desktop Chrome'],
        ...getTestProfile(TEST_PROFILE_03_C_CR_M_LD),
      },
    },
    {
      name: TEST_PROFILE_04_W_SR_M_LD,
      testDir: './__tests__/',
      use: {
        ...devices['Desktop Safari'],
        ...getTestProfile(TEST_PROFILE_04_W_SR_M_LD),
      },
    },
    {
      name: TEST_PROFILE_05_W_SP_M_LD,
      testDir: './__tests__/',
      use: {
        ...devices['Desktop Safari'],
        ...getTestProfile(TEST_PROFILE_05_W_SP_M_LD),
      },
    },
    {
      name: TEST_PROFILE_06_W_CR_M_LD,
      testDir: './__tests__/',
      use: {
        ...devices['Desktop Safari'],
        ...getTestProfile(TEST_PROFILE_06_W_CR_M_LD),
      },
    },
    {
      name: TEST_PROFILE_07_F_SR_M_LD,
      testDir: './__tests__/',
      use: {
        ...devices['Desktop Firefox'],
        ...getTestProfile(TEST_PROFILE_07_F_SR_M_LD),
      },
    },
    {
      name: TEST_PROFILE_08_F_SP_M_LD,
      testDir: './__tests__/',
      use: {
        ...devices['Desktop Firefox'],
        ...getTestProfile(TEST_PROFILE_08_F_SP_M_LD),
      },
    },
    {
      name: TEST_PROFILE_09_F_CR_M_LD,
      testDir: './__tests__/',
      use: {
        ...devices['Desktop Firefox'],
        ...getTestProfile(TEST_PROFILE_09_F_CR_M_LD),
      },
    },
    {
      name: TEST_PROFILE_10_C_SR_L_LD,
      testDir: './__tests__/',
      use: {
        ...devices['Desktop Chrome'],
        ...getTestProfile(TEST_PROFILE_10_C_SR_L_LD),
      },
    },
    {
      name: TEST_PROFILE_11_C_CR_L_LD,
      testDir: './__tests__/',
      use: {
        ...devices['Desktop Chrome'],
        ...getTestProfile(TEST_PROFILE_11_C_CR_L_LD),
      },
    },
    {
      name: TEST_PROFILE_12_W_SR_L_LD,
      testDir: './__tests__/',
      use: {
        ...devices['Desktop Safari'],
        ...getTestProfile(TEST_PROFILE_12_W_SR_L_LD),
      },
    },
    {
      name: TEST_PROFILE_13_W_CR_L_LD,
      testDir: './__tests__/',
      use: {
        ...devices['Desktop Safari'],
        ...getTestProfile(TEST_PROFILE_13_W_CR_L_LD),
      },
    },
    {
      name: TEST_PROFILE_14_F_SR_L_LD,
      testDir: './__tests__/',
      use: {
        ...devices['Desktop Firefox'],
        ...getTestProfile(TEST_PROFILE_14_F_SR_L_LD),
      },
    },
    {
      name: TEST_PROFILE_15_F_CR_L_LD,
      testDir: './__tests__/',
      use: {
        ...devices['Desktop Firefox'],
        ...getTestProfile(TEST_PROFILE_15_F_CR_L_LD),
      },
    },
  ],
  retries: IS_CI ? 4 : 1,
  testIgnore: /\/__tests__\/unit\//,
  timeout: 150000,
  use: {
    navigationTimeout: 30000,
    // this causes issues in the CI on on current version.
    //trace: 'retain-on-failure',
    video: 'on-first-retry',
  },
  webServer: IS_CI
    ? {
        command: 'npm run preview',
        port: 4000,
        reuseExistingServer: true,
        timeout: 120 * 1000,
      }
    : undefined,
  workers: 4,
});

export default config;
