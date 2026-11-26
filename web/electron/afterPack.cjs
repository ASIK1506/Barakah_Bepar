const fs = require('fs');
const path = require('path');
const ResEdit = require('resedit');

/**
 * electron-builder afterPack hook.
 * Embeds build/icon.ico and Windows VersionInfo directly into the packaged .exe
 * using pure-JS resedit so signAndEditExecutable:false (used to bypass winCodeSign
 * privilege errors on Windows) never leaves the default Electron atom icon behind.
 */
exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== 'win32') return;

  const projectDir = context.packager.projectDir;
  const productFilename = context.packager.appInfo.productFilename;
  const productName = context.packager.appInfo.productName;
  const versionStr = context.packager.appInfo.version || '1.0.0';
  const copyright = context.packager.appInfo.copyright || 'Copyright (c) 2026 Barakah Bepaar Retail Systems';
  const description = context.packager.appInfo.description || productName;

  const exePath = path.join(context.appOutDir, `${productFilename}.exe`);
  const icoPath = path.join(projectDir, 'build', 'icon.ico');

  if (!fs.existsSync(exePath)) {
    throw new Error(`afterPack: executable not found at ${exePath}`);
  }
  if (!fs.existsSync(icoPath)) {
    throw new Error(`afterPack: icon not found at ${icoPath}`);
  }

  const exeData = fs.readFileSync(exePath);
  const exe = ResEdit.NtExecutable.from(exeData, { ignoreCert: true });
  const res = ResEdit.NtExecutableResource.from(exe);

  const iconFile = ResEdit.Data.IconFile.from(fs.readFileSync(icoPath));
  const existingGroups = ResEdit.Resource.IconGroupEntry.fromEntries(res.entries);
  const targetIconId = existingGroups.length > 0 ? existingGroups[0].id : 1;
  const targetIconLang = existingGroups.length > 0 ? existingGroups[0].lang : 1033;

  // Remove any leftover icon groups before writing the new multi-resolution icon
  for (const grp of existingGroups) {
    if (grp.id !== targetIconId || grp.lang !== targetIconLang) {
      ResEdit.Resource.IconGroupEntry.replaceIconsForResource(res.entries, grp.id, grp.lang, []);
    }
  }

  ResEdit.Resource.IconGroupEntry.replaceIconsForResource(
    res.entries,
    targetIconId,
    targetIconLang,
    iconFile.icons.map(item => item.data)
  );

  // Update VersionInfo metadata for Explorer & Task Manager
  const parts = versionStr.split('.').map(n => parseInt(n, 10) || 0);
  const [maj = 1, min = 0, pat = 0] = parts;
  const viList = ResEdit.Resource.VersionInfo.fromEntries(res.entries);
  if (viList.length > 0) {
    const vi = viList[0];
    const langs = vi.getAllLanguagesForStringValues();
    const langObj = langs[0] || { lang: 1033, codepage: 1200 };
    vi.setFileVersion(maj, min, pat, 0, langObj.lang);
    vi.setProductVersion(maj, min, pat, 0, langObj.lang);
    vi.setStringValues(langObj, {
      CompanyName: 'Barakah Bepaar Retail Systems',
      FileDescription: description,
      FileVersion: `${maj}.${min}.${pat}.0`,
      InternalName: productFilename,
      LegalCopyright: copyright,
      OriginalFilename: `${productFilename}.exe`,
      ProductName: productName,
      ProductVersion: `${maj}.${min}.${pat}`
    });
    vi.outputToResourceEntries(res.entries);
  }

  res.outputResource(exe);
  const outBuf = Buffer.from(exe.generate());
  fs.writeFileSync(exePath, outBuf);
  console.log(`[afterPack] Embedded custom icon (${iconFile.icons.length} frames) and VersionInfo v${versionStr} into ${exePath}`);
};
