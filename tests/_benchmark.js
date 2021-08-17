const fs = require("fs");
const path = require("path");

if(!fs.existsSync(path.resolve(__dirname, "..", ".dist", "npm"))){
  console.error("You need to build first");
  process.exit(0);
  return;
}

const {now} = require("perf_hooks").performance;

/*
# Equivalent Python code
import time
bi = 0x1b199f15c1a55ba3e1b53361c79f19dd33778f7f81a7d5bd0de76f21491be96fd385057191c9551551f93deb51bdffeb0d498b2df5dbfdd9d92b8129ad9dbfd963a349235f8b19f329db63bd75157b5bf3774d09b7f3cd75073d63e90d77ed977bc1d761698115fbc57bb9830b292551095517e95b9d351b4b4fa1713745b3ed6f6571d3c745596f4727f3659f6f07a3ff7bd3f18fe7f57da54f412b4505c9172fc71dfb2fd5add50d43d7c5e5edf7c325e50545b50703c7e5478d7579a905a571256b0be76bbdb77d977dd711273781af57373ba3571fab2fef4f31930d674dcdad8da5b577956b1753dd2df9c5f9f9bf6d7b7f616389478b2515a5bd4d3d39cdf1e7e383fdc12327e71f63d971d9d13d514f9f91631bbba91f59a9736f5547975f5d71214fa347ebdf791dd7d33f69f55f6ba72fc7897da19519193f893d1b0f179799b94d379d6b87617b3331d78359f7f9276fdf9d632fb91d31a9b19155d37de3219f11cbe7a1098d8f298f43056f4923b199dd4dc5e1ddbdad9725c3bbaf2f7bd757ad23111bbded59e54f6bad858f0bf9bf8f197b6fe517373563f1bbb375a10307a935730d25b52947ad9b3969416f4be9a7656dfd7bab3f1fcb158b03d58f43cf832dfbb9fdef87a9f951133faf039f1b55e949fdcd41e72d97c3ad79a5bf37bbd17bd3d90565f1e51f8fe30f496943abd795610b3b39f5710709d9af3da53bf1d74951477923dffd21b32f11f3b9fd2b716b93d97d957bfda5fd41377db7c1d523b1391779ed4933d93b7d9513bbcb8daf45f3377dd9fd31138da149db1f81095b6135eba7d99ff5c509df9db9df6b1557e3cdf9037f058bdbc9117d3f55413751eb852d796d711513dd8d6b6f794fc39335c15f2bafed23992b711fd561f79f635dafed3799350d5387b94315918b45cbbf2f578dad93ddb7637749eda5197345536f319593958b45f78d8d8d71b30d2fc76b256919d5879d9da349b3d92f0fe1373ba531738b83056565554331c713e98b691f132399279137375149476ba947a3735931d76d679b4f77691dd35393a161dd3ba3937dc5d1790f69893593ff43fdbf91777faddbd18bf1b967e56de1c5410d418ddbf313558fd56b076f69095fcf4dcd8bf7354b39212f1b712781ddaf934777ad6faf5f87ed95d585e7675b59d3bbcbf7656565ed4b718def0767991f6d9385533f15b5fbfde7fb5f41490f897d4bb543136b110f879f819fd179df49173de19d71658385253b4967416375a7ed159f47330d7305a77bb9ddb36fc76b0b4f17f567b72b4551a70111e70b2f097bcded3da1fb656179d96fbba949bd231f5d6db961e199b77bef571fe7b79bc339b12db7c9cda9b70d3d9dd7514ba7f9f71993d9dfe1237fcf4549e75d6bf9a5af13379b99318f076da9c1954dbd1df377cd394f25cb4f5d6195f92b77bbcd6959a3cf67412583850b59919d49a37de5c3b7610301cf0b3be71545b78fa31b73a9d9db939d0915ff3b4fd95fd32f0fb3a9af0df3b73f6f994beff97b170d19f1f5fb6b57c353852be3adfbc1711907e73743673bc527c3dfab47b77bfb0d7d65c94da56147cfcd753dd3e309df7b5f7f518d31717dcd4f913521570183d751736531fb5f41d3719505bb9b85db09bdbfc779f17987cd7765b1cdc1df2fa5790947bb61811fa10b21df6bd33549ad43df93af5365d95f8bdfbfd103e907559fb393a5e3897df1797f315f330561d391836f3123eb494fcf191d61ad6931cb4d2113517375c5b31583dbe195c125e9e1fbcf89fd494145c1794f4319a5857baf7d19dfc3016dab3d85a187f7373fbb7b45875ba3e33d61e9a5e95915a181299b0d0f1f818de11f6b0f1fb317c9fd1bdd4dd7b30517333b15eda983e3ab271381c35dab4521b97fdb9bd7b383efadeb0139ef377ba5432597edeff127279d9d8b7bfb259bbfb9177381d907eb07593f2da921b5
st = time.perf_counter()
for i in range(5):
    bi *= bi
print('time: %.10f ms' % ((time.perf_counter() - st)*1000.0))
*/
function profile_bigint(){
  let bi = BigInt("0x1b199f15c1a55ba3e1b53361c79f19dd33778f7f81a7d5bd0de76f21491be96fd385057191c9551551f93deb51bdffeb0d498b2df5dbfdd9d92b8129ad9dbfd963a349235f8b19f329db63bd75157b5bf3774d09b7f3cd75073d63e90d77ed977bc1d761698115fbc57bb9830b292551095517e95b9d351b4b4fa1713745b3ed6f6571d3c745596f4727f3659f6f07a3ff7bd3f18fe7f57da54f412b4505c9172fc71dfb2fd5add50d43d7c5e5edf7c325e50545b50703c7e5478d7579a905a571256b0be76bbdb77d977dd711273781af57373ba3571fab2fef4f31930d674dcdad8da5b577956b1753dd2df9c5f9f9bf6d7b7f616389478b2515a5bd4d3d39cdf1e7e383fdc12327e71f63d971d9d13d514f9f91631bbba91f59a9736f5547975f5d71214fa347ebdf791dd7d33f69f55f6ba72fc7897da19519193f893d1b0f179799b94d379d6b87617b3331d78359f7f9276fdf9d632fb91d31a9b19155d37de3219f11cbe7a1098d8f298f43056f4923b199dd4dc5e1ddbdad9725c3bbaf2f7bd757ad23111bbded59e54f6bad858f0bf9bf8f197b6fe517373563f1bbb375a10307a935730d25b52947ad9b3969416f4be9a7656dfd7bab3f1fcb158b03d58f43cf832dfbb9fdef87a9f951133faf039f1b55e949fdcd41e72d97c3ad79a5bf37bbd17bd3d90565f1e51f8fe30f496943abd795610b3b39f5710709d9af3da53bf1d74951477923dffd21b32f11f3b9fd2b716b93d97d957bfda5fd41377db7c1d523b1391779ed4933d93b7d9513bbcb8daf45f3377dd9fd31138da149db1f81095b6135eba7d99ff5c509df9db9df6b1557e3cdf9037f058bdbc9117d3f55413751eb852d796d711513dd8d6b6f794fc39335c15f2bafed23992b711fd561f79f635dafed3799350d5387b94315918b45cbbf2f578dad93ddb7637749eda5197345536f319593958b45f78d8d8d71b30d2fc76b256919d5879d9da349b3d92f0fe1373ba531738b83056565554331c713e98b691f132399279137375149476ba947a3735931d76d679b4f77691dd35393a161dd3ba3937dc5d1790f69893593ff43fdbf91777faddbd18bf1b967e56de1c5410d418ddbf313558fd56b076f69095fcf4dcd8bf7354b39212f1b712781ddaf934777ad6faf5f87ed95d585e7675b59d3bbcbf7656565ed4b718def0767991f6d9385533f15b5fbfde7fb5f41490f897d4bb543136b110f879f819fd179df49173de19d71658385253b4967416375a7ed159f47330d7305a77bb9ddb36fc76b0b4f17f567b72b4551a70111e70b2f097bcded3da1fb656179d96fbba949bd231f5d6db961e199b77bef571fe7b79bc339b12db7c9cda9b70d3d9dd7514ba7f9f71993d9dfe1237fcf4549e75d6bf9a5af13379b99318f076da9c1954dbd1df377cd394f25cb4f5d6195f92b77bbcd6959a3cf67412583850b59919d49a37de5c3b7610301cf0b3be71545b78fa31b73a9d9db939d0915ff3b4fd95fd32f0fb3a9af0df3b73f6f994beff97b170d19f1f5fb6b57c353852be3adfbc1711907e73743673bc527c3dfab47b77bfb0d7d65c94da56147cfcd753dd3e309df7b5f7f518d31717dcd4f913521570183d751736531fb5f41d3719505bb9b85db09bdbfc779f17987cd7765b1cdc1df2fa5790947bb61811fa10b21df6bd33549ad43df93af5365d95f8bdfbfd103e907559fb393a5e3897df1797f315f330561d391836f3123eb494fcf191d61ad6931cb4d2113517375c5b31583dbe195c125e9e1fbcf89fd494145c1794f4319a5857baf7d19dfc3016dab3d85a187f7373fbb7b45875ba3e33d61e9a5e95915a181299b0d0f1f818de11f6b0f1fb317c9fd1bdd4dd7b30517333b15eda983e3ab271381c35dab4521b97fdb9bd7b383efadeb0139ef377ba5432597edeff127279d9d8b7bfb259bbfb9177381d907eb07593f2da921b5");
  let st = now();
  // [multiplication and memory allocation]
  for(let i=0;i<5;i++){
    bi *= bi;
  }
  // [multiplication only]
  // const bi2 = bi * bi;
  return [now() - st];
}

function profile_bigint_to_byte(){
  const {bigint_to_bytes, bigint_from_bytes} = require("../.dist/npm");
  let bi = BigInt("0x1b199f15c1a55ba3e1b53361c79f19dd33778f7f81a7d5bd0de76f21491be96fd385057191c9551551f93deb51bdffeb0d498b2df5dbfdd9d92b8129ad9dbfd963a349235f8b19f329db63bd75157b5bf3774d09b7f3cd75073d63e90d77ed977bc1d761698115fbc57bb9830b292551095517e95b9d351b4b4fa1713745b3ed6f6571d3c745596f4727f3659f6f07a3ff7bd3f18fe7f57da54f412b4505c9172fc71dfb2fd5add50d43d7c5e5edf7c325e50545b50703c7e5478d7579a905a571256b0be76bbdb77d977dd711273781af57373ba3571fab2fef4f31930d674dcdad8da5b577956b1753dd2df9c5f9f9bf6d7b7f616389478b2515a5bd4d3d39cdf1e7e383fdc12327e71f63d971d9d13d514f9f91631bbba91f59a9736f5547975f5d71214fa347ebdf791dd7d33f69f55f6ba72fc7897da19519193f893d1b0f179799b94d379d6b87617b3331d78359f7f9276fdf9d632fb91d31a9b19155d37de3219f11cbe7a1098d8f298f43056f4923b199dd4dc5e1ddbdad9725c3bbaf2f7bd757ad23111bbded59e54f6bad858f0bf9bf8f197b6fe517373563f1bbb375a10307a935730d25b52947ad9b3969416f4be9a7656dfd7bab3f1fcb158b03d58f43cf832dfbb9fdef87a9f951133faf039f1b55e949fdcd41e72d97c3ad79a5bf37bbd17bd3d90565f1e51f8fe30f496943abd795610b3b39f5710709d9af3da53bf1d74951477923dffd21b32f11f3b9fd2b716b93d97d957bfda5fd41377db7c1d523b1391779ed4933d93b7d9513bbcb8daf45f3377dd9fd31138da149db1f81095b6135eba7d99ff5c509df9db9df6b1557e3cdf9037f058bdbc9117d3f55413751eb852d796d711513dd8d6b6f794fc39335c15f2bafed23992b711fd561f79f635dafed3799350d5387b94315918b45cbbf2f578dad93ddb7637749eda5197345536f319593958b45f78d8d8d71b30d2fc76b256919d5879d9da349b3d92f0fe1373ba531738b83056565554331c713e98b691f132399279137375149476ba947a3735931d76d679b4f77691dd35393a161dd3ba3937dc5d1790f69893593ff43fdbf91777faddbd18bf1b967e56de1c5410d418ddbf313558fd56b076f69095fcf4dcd8bf7354b39212f1b712781ddaf934777ad6faf5f87ed95d585e7675b59d3bbcbf7656565ed4b718def0767991f6d9385533f15b5fbfde7fb5f41490f897d4bb543136b110f879f819fd179df49173de19d71658385253b4967416375a7ed159f47330d7305a77bb9ddb36fc76b0b4f17f567b72b4551a70111e70b2f097bcded3da1fb656179d96fbba949bd231f5d6db961e199b77bef571fe7b79bc339b12db7c9cda9b70d3d9dd7514ba7f9f71993d9dfe1237fcf4549e75d6bf9a5af13379b99318f076da9c1954dbd1df377cd394f25cb4f5d6195f92b77bbcd6959a3cf67412583850b59919d49a37de5c3b7610301cf0b3be71545b78fa31b73a9d9db939d0915ff3b4fd95fd32f0fb3a9af0df3b73f6f994beff97b170d19f1f5fb6b57c353852be3adfbc1711907e73743673bc527c3dfab47b77bfb0d7d65c94da56147cfcd753dd3e309df7b5f7f518d31717dcd4f913521570183d751736531fb5f41d3719505bb9b85db09bdbfc779f17987cd7765b1cdc1df2fa5790947bb61811fa10b21df6bd33549ad43df93af5365d95f8bdfbfd103e907559fb393a5e3897df1797f315f330561d391836f3123eb494fcf191d61ad6931cb4d2113517375c5b31583dbe195c125e9e1fbcf89fd494145c1794f4319a5857baf7d19dfc3016dab3d85a187f7373fbb7b45875ba3e33d61e9a5e95915a181299b0d0f1f818de11f6b0f1fb317c9fd1bdd4dd7b30517333b15eda983e3ab271381c35dab4521b97fdb9bd7b383efadeb0139ef377ba5432597edeff127279d9d8b7bfb259bbfb9177381d907eb07593f2da921b5");
  const st1 = now();
  let by = bigint_to_bytes(bi);
  const eta1 = now() - st1;
  const st2 = now();
  let bi2 = bigint_from_bytes(by);
  const eta2 = now() - st2;
  const st3 = now();
  const eq = bi === bi2;
  const eta3 = now() - st3;
  return [eta1, eta2, eta3];
}

const profiles = {
  profile_bigint,
  profile_bigint_to_byte,
};

/**
 * @param {string} profile_name
 * @param {number} n
 */
function run_profile(profile_name, n){
  const results = [];
  for(let i=0;i<n;i++){
    const result = profiles[profile_name]();
    for(let k=0;k<result.length;k++){
      const r = result[k];
      results[k] = (result[k] || 0) + r;
    }
  }
  
  let msg = `${profile_name}: `;
  for(let i=0;i<results.length;i++){
    results[i] /= n;
    msg += i === 0 ? `${results[i]}` : `, ${results[i]}`;
  }
  
  console.log(msg);
}

function main(){
  run_profile("profile_bigint", 3);
  run_profile("profile_bigint_to_byte", 3);
}

main();
