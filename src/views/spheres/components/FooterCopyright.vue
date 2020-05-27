<template functional>
  <div class="footer">
    <a class="support" href="mailto:support@onlinemeetup.connect.club">support@connect.club</a>
    <div class="copyright">© {{ new Date().getFullYear() }} CNNCT Ltd.</div>
  </div>
</template>


<style lang="css" scoped>
.footer {
  position: fixed;
  bottom: 34px;
  font-size: 15px;
  letter-spacing: -0.3px;
  color: #ffffff;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  align-self: center;
}

a.support {
  line-height: normal;
  text-decoration: none;
  color: #ffffff;
}

.copyright {
  opacity: 0.5;
}
</style>
