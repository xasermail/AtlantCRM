IF NOT EXISTS
	(
		select
			*
		from
			sys.databases as d
		where
			d.name = 'ATLANTCRM'			
	) 
begin
	CREATE DATABASE [ATLANTCRM] ON  PRIMARY 
	( NAME = N'ATLANTCRM', FILENAME = N'D:\IT-MINDS\BASES\ATLANTCRM\ATLANTCRM.mdf' , SIZE = 3072KB , FILEGROWTH = 10240KB )
	 LOG ON 
	( NAME = N'ATLANTCRM_log', FILENAME = N'D:\IT-MINDS\BASES\ATLANTCRM\ATLANTCRM_log.ldf' , SIZE = 1024KB , FILEGROWTH = 10%)
end;	
	GO
	ALTER DATABASE [ATLANTCRM] SET COMPATIBILITY_LEVEL = 100
	GO
	ALTER DATABASE [ATLANTCRM] SET ANSI_NULL_DEFAULT OFF 
	GO
	ALTER DATABASE [ATLANTCRM] SET ANSI_NULLS OFF 
	GO
	ALTER DATABASE [ATLANTCRM] SET ANSI_PADDING OFF 
	GO
	ALTER DATABASE [ATLANTCRM] SET ANSI_WARNINGS OFF 
	GO
	ALTER DATABASE [ATLANTCRM] SET ARITHABORT OFF 
	GO
	ALTER DATABASE [ATLANTCRM] SET AUTO_CLOSE OFF 
	GO
	ALTER DATABASE [ATLANTCRM] SET AUTO_CREATE_STATISTICS ON 
	GO
	ALTER DATABASE [ATLANTCRM] SET AUTO_SHRINK OFF 
	GO
	ALTER DATABASE [ATLANTCRM] SET AUTO_UPDATE_STATISTICS ON 
	GO
	ALTER DATABASE [ATLANTCRM] SET CURSOR_CLOSE_ON_COMMIT OFF 
	GO
	ALTER DATABASE [ATLANTCRM] SET CURSOR_DEFAULT  GLOBAL 
	GO
	ALTER DATABASE [ATLANTCRM] SET CONCAT_NULL_YIELDS_NULL OFF 
	GO
	ALTER DATABASE [ATLANTCRM] SET NUMERIC_ROUNDABORT OFF 
	GO
	ALTER DATABASE [ATLANTCRM] SET QUOTED_IDENTIFIER OFF 
	GO
	ALTER DATABASE [ATLANTCRM] SET RECURSIVE_TRIGGERS OFF 
	GO
	ALTER DATABASE [ATLANTCRM] SET  DISABLE_BROKER WITH ROLLBACK IMMEDIATE; 
	GO
	ALTER DATABASE [ATLANTCRM] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
	GO
	ALTER DATABASE [ATLANTCRM] SET DATE_CORRELATION_OPTIMIZATION OFF 
	GO
	ALTER DATABASE [ATLANTCRM] SET PARAMETERIZATION SIMPLE 
	GO
	ALTER DATABASE [ATLANTCRM] SET  READ_WRITE 
	GO
	ALTER DATABASE [ATLANTCRM] SET RECOVERY SIMPLE WITH NO_WAIT
	GO
	ALTER DATABASE [ATLANTCRM] SET  MULTI_USER 
	GO
	ALTER DATABASE [ATLANTCRM] SET PAGE_VERIFY CHECKSUM  

	USE [ATLANTCRM]
	GO
	IF NOT EXISTS (SELECT name FROM sys.filegroups WHERE is_default=1 AND name = N'PRIMARY') ALTER DATABASE [ATLANTCRM] MODIFY FILEGROUP [PRIMARY] DEFAULT
	GO

USE ATLANTCRM;

declare
	@table varchar(50), 
	@s varchar(max),
	@date varchar(11),
	@load_num bigint;

if object_id('tempdb..#table') is not null drop table #table;
create table #table(TABLE_NAME varchar(250));
set @s = '	insert into #table
			select
				*
			from openrowset(''sqloledb.1'', 
							''sql5028.myasp.net'';
							''DB_A12B63_ATLANTCRM_admin'';
							''FCCRrd63e559d5d'', 
							''select TABLE_NAME from DB_A12B63_ATLANTCRM.INFORMATION_SCHEMA.TABLES'')';
exec(@s);

while (exists(select 1 from #table))
begin
	set @table = (select top 1 TABLE_NAME from #table);
	set @s = 'if object_id(''ATLANTCRM.dbo.' + @table + ''') is not null drop table ATLANTCRM.dbo.' + @table + ';';
	print(@s);
	exec(@s);
	set @s = '
				select
					*
				into ATLANTCRM.dbo.' + @table + '
				from openrowset(''sqloledb.1'', 
								''sql5028.myasp.net'';
								''DB_A12B63_ATLANTCRM_admin'';
								''FCCRrd63e559d5d'', 
								''select * from DB_A12B63_ATLANTCRM.dbo.'+@table+''')';
	print(@s);
	exec(@s);
	
	delete from #table where TABLE_NAME = @table;
end;

---- collate latin to cp1251
--select *
--    from openrowset(
--'sqloledb.1',
--'sql5028.myasp.net';
--'DB_A12B63_ATLANTCRM_admin';
--'FCCRrd63e559d5d',
--'select cast(surname as nvarchar(255)) from DB_A12B63_ATLANTCRM.dbo.o_ank');