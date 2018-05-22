if exists(select 1 from sys.procedures as a where a.name = 'GET_SMS_AUTO_SEND_LIST') drop procedure dbo.GET_SMS_AUTO_SEND_LIST;

GO

create procedure [dbo].[GET_SMS_AUTO_SEND_LIST]
as begin
  if object_id('tempdb..#data') is not null drop table #data;

  create table #data(
    id int not null identity primary key,
    o_ank_id int,
		surname varchar(1000),
		name varchar(1000),
		secname varchar(1000),
		phone varchar(1000),
		d_start smalldatetime,
		m_org_id int,
		m_sms_template_type_id int,
		soob varchar(4000),
		d_reg smalldatetime,
		d_send smalldatetime,
		d_sob smalldatetime
  );
  
	-- день рождения
	insert into #data
  select a.ID,
         isnull(a.SURNAME,'') SURNAME,
         isnull(a.NAME,'') NAME,
         isnull(a.SECNAME,'') SECNAME,
         replace(replace(replace(replace(a.PHONE_MOBILE,'(',''),')',''),'-',''),' ','') PHONE,
         dbo.CREATE_DATE(m.ID) D_START,
         a.M_ORG_ID,
         s.ID M_SMS_TEMPLATE_TYPE_ID,
         t.SOOB,
				 null D_REG,
				 dbo.CREATE_DATE(m.ID) D_SEND,
				 null D_SOB
    from dbo.M_ORG m
    join dbo.M_SMS_TEMPLATE_TYPE s on s.ID = 1
    join dbo.O_NASTR n on n.M_ORG_ID = m.ID and n.SMS_AUTO_SEND = 1
    join dbo.M_SMS_TEMPLATE t on t.M_ORG_ID = m.ID and t.M_SMS_TEMPLATE_TYPE_ID = s.ID and isnull(t.SOOB,'')<>''
    join dbo.O_ANK a on a.M_ORG_ID = m.ID
   where m.DEISTV = 1 and m.M_ORG_TYPE_ID = 4 and a.PHONE_MOBILE is not null
     and isnull(n.SMS_LOGIN,'') <> '' and isnull(n.SMS_PASSWORD,'') <> ''
     and (MONTH(a.BIRTHDAY)=MONTH(dbo.CREATE_DATE(m.ID)) and DAY(a.BIRTHDAY)=DAY(dbo.CREATE_DATE(m.ID)))
     and not exists (select 1 from dbo.O_SMS_SEND ss
                      where ss.M_ORG_ID = m.ID and ss.O_ANK_ID = a.ID
                        and ss.M_SMS_TEMPLATE_ID = s.ID and YEAR(ss.D_START) = YEAR(dbo.CREATE_DATE(m.ID)));
  
  -- напоминание за 2 дня до платежа
  insert into #data
  select a.ID,
         isnull(a.SURNAME,'') SURNAME,
         isnull(a.NAME,'') NAME,
         isnull(a.SECNAME,'') SECNAME,
         replace(replace(replace(replace(a.PHONE_MOBILE,'(',''),')',''),'-',''),' ','') PHONE,
         dbo.CREATE_DATE(m.ID) D_START,
         a.M_ORG_ID,
         s.ID M_SMS_TEMPLATE_TYPE_ID,
         t.SOOB,
         null D_REG,
         dbo.CREATE_DATE(m.ID) D_SEND,
				 (select max(cast(u.D_SOB as date))
            from dbo.O_SKLAD_RAS r
            join dbo.O_UVEDOML u on r.ID = u.O_SKLAD_RAS_ID and u.O_SKLAD_RAS_NOMER = 1 and u.M_VID_SOB_ID = 5 and u.ISP = 0
           where r.O_ANK_ID = a.ID and datediff(DAY, cast(u.D_SOB as date), cast(dbo.CREATE_DATE(a.M_ORG_ID) as date)) = -2) D_SOB
    from dbo.M_ORG m
    join dbo.M_SMS_TEMPLATE_TYPE s on s.ID = 2
    join dbo.O_NASTR n on n.M_ORG_ID = m.ID and n.SMS_AUTO_SEND = 1
    join dbo.M_SMS_TEMPLATE t on t.M_ORG_ID = m.ID and t.M_SMS_TEMPLATE_TYPE_ID = s.ID and isnull(t.SOOB,'')<>''
    join dbo.O_ANK a on a.M_ORG_ID = m.ID
   where m.DEISTV = 1 and m.M_ORG_TYPE_ID = 4 and a.PHONE_MOBILE is not null
     and isnull(n.SMS_LOGIN,'') <> '' and isnull(n.SMS_PASSWORD,'') <> ''
	   and exists (select 1
                   from dbo.O_SKLAD_RAS r
                   join dbo.O_UVEDOML u on r.ID = u.O_SKLAD_RAS_ID and u.O_SKLAD_RAS_NOMER = 1 and u.M_VID_SOB_ID = 5 and u.ISP = 0
                  where r.O_ANK_ID = a.ID and datediff(DAY, cast(u.D_SOB as date), cast(dbo.CREATE_DATE(a.M_ORG_ID) as date)) = -2)
     and not exists (select 1 from dbo.O_SMS_SEND ss
                      where ss.M_ORG_ID = m.ID and ss.O_ANK_ID = a.ID
                        and ss.M_SMS_TEMPLATE_ID = s.ID and cast(ss.D_START as date) = cast(dbo.CREATE_DATE(m.ID) as date))  
  
  -- не ходит 30 дней и есть абонемент
  insert into #data
  select a.* from (
	  select a.ID,
           isnull(a.SURNAME,'') SURNAME,
           isnull(a.NAME,'') NAME,
           isnull(a.SECNAME,'') SECNAME,
           replace(replace(replace(replace(a.PHONE_MOBILE,'(',''),')',''),'-',''),' ','') PHONE,
           dbo.CREATE_DATE(m.ID) D_START,
           a.M_ORG_ID,
           s.ID M_SMS_TEMPLATE_TYPE_ID,
           t.SOOB,
           (select max(o.D_REG) from dbo.O_SEANS o where o.o_ank_id = a.ID and o.SEANS_STATE = 1 and m_org_id = a.M_ORG_ID) D_REG,
					 dbo.CREATE_DATE(m.ID) D_SEND,
					 null D_SOB
      from dbo.M_ORG m
      join dbo.M_SMS_TEMPLATE_TYPE s on s.ID = 3
      join dbo.O_NASTR n on n.M_ORG_ID = m.ID and n.SMS_AUTO_SEND = 1
      join dbo.M_SMS_TEMPLATE t on t.M_ORG_ID = m.ID and t.M_SMS_TEMPLATE_TYPE_ID = s.ID and isnull(t.SOOB,'')<>''
      join dbo.O_ANK a on a.M_ORG_ID = m.ID
     where m.DEISTV = 1 and m.M_ORG_TYPE_ID = 4 and a.PHONE_MOBILE is not null
       and isnull(n.SMS_LOGIN,'') <> '' and isnull(n.SMS_PASSWORD,'') <> ''
	     and exists (select 1
                     from dbo.O_SKLAD_RAS r
                     join dbo.O_SKLAD_RAS_PRODUCT p on r.ID = p.O_SKLAD_RAS_ID and isnull(p.COST,0) > 0
                     join dbo.M_PRODUCT pr on p.M_PRODUCT_ID = pr.ID and pr.IS_ABON = 1
                    where r.O_ANK_ID = a.ID and p.IS_VID = 1 and p.D_VID is not null and p.D_DEISTV > dbo.CREATE_DATE(m.ID))
       and not exists (select 1 from dbo.O_SMS_SEND ss
                        where ss.M_ORG_ID = m.ID and ss.O_ANK_ID = a.ID
                          and ss.M_SMS_TEMPLATE_ID = s.ID and cast(ss.D_START as date) = cast(dbo.CREATE_DATE(m.ID) as date))
  ) a
   where datediff(MONTH, a.D_REG, dbo.CREATE_DATE(a.M_ORG_ID)) = 1;
  
  delete from #data where DATEPART(HOUR, d_send) < 10 and DATEPART(HOUR, d_send) > 13;
  --delete from #data where o_ank_id <> 9351;

  update #data
	   set soob = replace(soob, '<ИО>', name + ' ' + secname);
  
  update #data
	   set soob = replace(soob, '<Дата>', convert(varchar(10),d_sob,104))
   where m_sms_template_type_id = 2;
  
  select O_ANK_ID, PHONE, D_START, M_ORG_ID, M_SMS_TEMPLATE_TYPE_ID, SOOB from #data order by id;
  if object_id('tempdb..#data') is not null drop table #data;
end;

/*

GO

exec [dbo].[GET_SMS_AUTO_SEND_LIST];

GO

*/